import { ChannelTypeEnum, StepTypeEnum } from '@novu/shared';
import { subMonths, subWeeks } from 'date-fns';
import { FilterQuery, QueryWithHelpers, Types } from 'mongoose';

import type { EnforceEnvOrOrgIds } from '../../types';
import { BaseRepository } from '../base-repository';
import { EnvironmentId } from '../environment';
import { NotificationDBModel, NotificationEntity } from './notification.entity';
import { NotificationFeedItemEntity } from './notification.feed.Item.entity';
import { Notification } from './notification.schema';

export class NotificationRepository extends BaseRepository<
  NotificationDBModel,
  NotificationEntity,
  EnforceEnvOrOrgIds
> {
  constructor() {
    super(Notification, NotificationEntity);
  }

  async findBySubscriberId(environmentId: string, subscriberId: string) {
    return await this.find({
      _environmentId: environmentId,
      _subscriberId: subscriberId,
    });
  }

  async getFeed(
    environmentId: string,
    query: {
      channels?: ChannelTypeEnum[] | null;
      templates?: string[] | null;
      subscriberIds?: string[];
      transactionId?: string;
      topicKey?: string;
      after?: string;
      before?: string;
    } = {},
    skip = 0,
    limit = 10
  ): Promise<NotificationFeedItemEntity[]> {
    const requestQuery: FilterQuery<NotificationDBModel> = {
      _environmentId: environmentId,
    };

    if (query.transactionId) {
      requestQuery.transactionId = query.transactionId;
    }

    if (query.topicKey) {
      requestQuery['topics.topicKey'] = query.topicKey;
    }

    if (query.after || query.before) {
      requestQuery.createdAt = {};

      if (query.after) {
        requestQuery.createdAt.$gte = query.after;
      }

      if (query.before) {
        requestQuery.createdAt.$lte = query.before;
      }
    }

    if (query?.templates) {
      requestQuery._templateId = {
        $in: query.templates,
      };
    }

    if (query.subscriberIds && query.subscriberIds.length > 0) {
      requestQuery._subscriberId = {
        $in: query.subscriberIds,
      };
    }

    if (query?.channels) {
      requestQuery.channels = {
        $in: query.channels,
      };
    }

    const response = await this.populateFeed(this.MongooseModel.find(requestQuery), environmentId)
      .read('secondaryPreferred')
      .skip(skip)
      .limit(limit)
      .sort('-createdAt');

    return this.mapEntities(response) as unknown as NotificationFeedItemEntity[];
  }

  public async getFeedItem(
    notificationId: string,
    _environmentId: string,
    _organizationId: string
  ): Promise<NotificationFeedItemEntity> {
    const requestQuery: FilterQuery<NotificationDBModel> = {
      _id: notificationId,
      _environmentId,
      _organizationId,
    };

    return this.mapEntity(
      await this.populateFeed(this.MongooseModel.findOne(requestQuery), _environmentId)
    ) as unknown as NotificationFeedItemEntity;
  }

  private populateFeed(query: QueryWithHelpers<unknown, unknown, unknown>, environmentId: string) {
    return query
      .populate({
        options: {
          readPreference: 'secondaryPreferred',
        },
        path: 'subscriber',
        select: 'firstName _id lastName email phone subscriberId',
      })
      .populate({
        options: {
          readPreference: 'secondaryPreferred',
        },
        path: 'template',
        select: '_id name triggers origin',
      })
      .populate({
        options: {
          readPreference: 'secondaryPreferred',
          sort: { createdAt: 1, _parentId: 1 },
        },
        path: 'jobs',
        match: {
          _environmentId: new Types.ObjectId(environmentId),
          type: {
            $nin: [StepTypeEnum.TRIGGER],
          },
        },
        select: 'createdAt digest payload overrides to tenant actorId providerId step status type updatedAt _parentId',
        populate: [
          {
            path: 'executionDetails',
            select: 'createdAt detail isRetry isTest providerId raw source status updatedAt webhookStatus',
            options: {
              sort: { createdAt: 1 },
            },
          },
          {
            path: 'step',
            select: '_parentId _templateId active filters template',
          },
        ],
      });
  }

  async getActivityGraphStats(date: Date, environmentId: string) {
    return await this.aggregate(
      [
        {
          $match: {
            createdAt: { $gte: date },
            _environmentId: new Types.ObjectId(environmentId),
          },
        },
        { $unwind: '$channels' },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: {
              $sum: 1,
            },
            templates: { $addToSet: '$_templateId' },
            channels: { $addToSet: '$channels' },
          },
        },
        { $sort: { createdAt: -1 } },
      ],
      {
        readPreference: 'secondaryPreferred',
      }
    );
  }

  async getStats(environmentId: EnvironmentId): Promise<{ weekly: number; monthly: number }> {
    const now: number = Date.now();
    const monthBefore = subMonths(now, 1);
    const weekBefore = subWeeks(now, 1);

    const result = await this.aggregate(
      [
        {
          $match: {
            _environmentId: this.convertStringToObjectId(environmentId),
            createdAt: {
              $gte: monthBefore,
            },
          },
        },
        {
          $group: {
            _id: null,
            weekly: { $sum: { $cond: [{ $gte: ['$createdAt', weekBefore] }, 1, 0] } },
            monthly: { $sum: 1 },
          },
        },
      ],
      {
        readPreference: 'secondaryPreferred',
      }
    );

    const stats = result[0] || {};

    return {
      weekly: stats.weekly || 0,
      monthly: stats.monthly || 0,
    };
  }

  estimatedDocumentCount() {
    return this.MongooseModel.estimatedDocumentCount();
  }
}
