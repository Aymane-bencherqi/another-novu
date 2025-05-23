import { ActorTypeEnum } from '@novu/shared';
import mongoose, { Schema } from 'mongoose';

import { schemaOptions } from '../schema-default.options';
import { MessageDBModel } from './message.entity';

const messageSchema = new Schema<MessageDBModel>(
  {
    _templateId: {
      type: Schema.Types.ObjectId,
      ref: 'NotificationTemplate',
    },
    _environmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Environment',
    },
    _messageTemplateId: {
      type: Schema.Types.ObjectId,
    },
    _notificationId: {
      type: Schema.Types.ObjectId,
      ref: 'Notification',
    },
    _organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
    },
    _subscriberId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscriber',
    },
    _jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
    },
    templateIdentifier: Schema.Types.String,
    email: Schema.Types.String,
    subject: Schema.Types.String,
    cta: {
      type: {
        type: Schema.Types.String,
      },
      data: Schema.Types.Mixed,
      action: {
        status: Schema.Types.String,
        buttons: [
          {
            type: {
              type: Schema.Types.String,
            },
            content: Schema.Types.String,
            resultContent: Schema.Types.String,
            url: Schema.Types.String,
            target: Schema.Types.String,
          },
        ],
        result: {
          payload: Schema.Types.Mixed,
          type: {
            type: Schema.Types.String,
          },
        },
      },
    },
    _feedId: {
      type: Schema.Types.ObjectId,
      ref: 'Feed',
    },
    channel: Schema.Types.String,
    content: Schema.Types.Mixed,
    phone: Schema.Types.String,
    directWebhookUrl: Schema.Types.String,
    providerId: Schema.Types.String,
    deviceTokens: [Schema.Types.Array],
    title: Schema.Types.String,
    seen: {
      type: Schema.Types.Boolean,
      default: false,
    },
    read: {
      type: Schema.Types.Boolean,
      default: false,
    },
    archived: {
      type: Schema.Types.Boolean,
      default: false,
    },
    snoozedUntil: Schema.Types.Date,
    deliveredAt: {
      type: [Schema.Types.Date],
      default: undefined,
    },
    lastSeenDate: Schema.Types.Date,
    lastReadDate: Schema.Types.Date,
    archivedAt: Schema.Types.Date,
    status: {
      type: Schema.Types.String,
      default: 'sent',
    },
    errorId: Schema.Types.String,
    errorText: Schema.Types.String,
    providerResponse: Schema.Types.Mixed,
    transactionId: {
      type: Schema.Types.String,
    },
    identifier: Schema.Types.String,
    payload: Schema.Types.Mixed,
    data: Schema.Types.Mixed,
    overrides: Schema.Types.Mixed,
    actor: {
      type: {
        type: Schema.Types.String,
        enum: ActorTypeEnum,
      },
      data: Schema.Types.Mixed,
    },
    _actorId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscriber',
    },
    tags: [Schema.Types.String],
    avatar: Schema.Types.String,
  },
  schemaOptions
);

/**
 * todo: all the pre hooks should be removed after all the soft deletes are removed task nv-5688
 */
messageSchema.pre('find', function filterDeletedFind() {
  this.where({ deleted: { $ne: true } });
});
messageSchema.pre('findOne', function filterDeletedFindOne() {
  this.where({ deleted: { $ne: true } });
});
messageSchema.pre('findOneAndUpdate', function filterDeletedFindOneAndUpdate() {
  this.where({ deleted: { $ne: true } });
});
messageSchema.pre('countDocuments', function filterDeletedCountDocuments() {
  this.where({ deleted: { $ne: true } });
});
messageSchema.pre('count', function filterDeletedCount() {
  this.where({ deleted: { $ne: true } });
});

messageSchema.virtual('subscriber', {
  ref: 'Subscriber',
  localField: '_subscriberId',
  foreignField: '_id',
  justOne: true,
});

messageSchema.virtual('template', {
  ref: 'NotificationTemplate',
  localField: '_templateId',
  foreignField: '_id',
  justOne: true,
});

messageSchema.virtual('actorSubscriber', {
  ref: 'Subscriber',
  localField: '_actorId',
  foreignField: '_id',
  justOne: true,
});

/*
 * This index was initially created to optimize:
 *
 * Path : libs/dal/src/repositories/message/message.repository.ts
 * Context : findBySubscriberChannel()
 * Query : find({
 * _environmentId: environmentId,
 * _subscriberId: subscriberId,
 * channel,
 * _feedId
 * seen
 * read,
 * sort: '-createdAt',
 * });
 *
 * Path : libs/dal/src/repositories/message/message.repository.ts
 * Context : markAllMessagesAs()
 * Query : update({
 *   _subscriberId: subscriberId,
 *   _environmentId: environmentId,
 *   seen: false,
 *   read: false,
 *   ...(feedQuery && { _feedId: feedQuery })
 *   channel,
 * })
 *
 * Path : libs/dal/src/repositories/message/message.repository.ts
 * Context : getCount()
 * Query : count( _environmentId, _subscriberId, channel, _feedId, seen, read)
 *
 * Path : libs/dal/src/repositories/message/message.repository.ts
 * Context : getTotalCount()
 * Query : count( _environmentId, _subscriberId, channel, _feedId, seen, read)
 *
 * Path : apps/api/src/app/messages/usecases/get-messages/get-messages.usecase.ts
 *    Context : execute()
 *       Query : count({
 *          _environmentId: command.environmentId,
 *          _subscriber: subscriber._id,
 *           channel = command.channel;
 *        })
 *       Query : find({
 *          _environmentId: command.environmentId,
 *          _subscriber: subscriber._id,
 *           channel = command.channel;
 *        })
 */
messageSchema.index({
  _subscriberId: 1,
  _environmentId: 1,
  channel: 1,
  read: 1,
  archived: 1,
  seen: 1,
  snoozedUntil: 1,
  createdAt: -1,
});

/*
 * Path : libs/dal/src/repositories/message/message.repository.ts
 * Context : updateFeedByMessageTemplateId()
 * Query : update({ _environmentId: environmentId, _messageTemplateId: messageId }
 */
messageSchema.index({
  _messageTemplateId: 1,
  _environmentId: 1,
});

/*
 * This index was initially created to optimize:
 *
 * apps/api/src/app/events/usecases/send-message/send-message-in-app.usecase.ts
 * execute
 * findOne({
 *   _notificationId: notification._id,
 *   _environmentId: command.environmentId,
 *   _subscriberId: command._subscriberId,
 *   _templateId: notification._templateId,
 *   _messageTemplateId: inAppChannel.template._id,
 *   channel: ChannelTypeEnum.IN_APP,
 *   transactionId: command.transactionId,
 *   providerId: InAppProviderIdEnum.Novu,
 *   _feedId: inAppChannel.template._feedId,
 * });
 *
 *
 * Path: libs/application-generic/src/usecases/conditions-filter/conditions-filter.usecase.ts
 * Context: processPreviousStep
 * Query: findOne({
 *   _jobId: job._id,
 *   _environmentId: command.environmentId,
 *   _subscriberId: command._subscriberId ? command._subscriberId : command.subscriberId,
 *   transactionId: command.transactionId,
 * });
 *
 * Path: apps/api/src/app/inbound-parse/usecases/inbound-email-parse/inbound-email-parse.usecase.ts
 * Context: getEntities()
 * Query: findOne({
 *   transactionId,
 *   _environmentId: environment._id,
 *   _subscriberId: subscriber._id,
 * });
 */
messageSchema.index({
  transactionId: 1,
  _subscriberId: 1,
  _environmentId: 1,
  providerId: 1,
});

/*
 * This index was initially created to optimize:
 *
 * Path: apps/api/src/app/integrations/usecases/calculate-limit-novu-integration/calculate-limit-novu-integration.usecase.ts
 * Context: execute()
 * Query: count(
 *   {
 *     channel: command.channelType,
 *     _environmentId: command.environmentId,
 *     providerId,
 *     createdAt: { $gte: startOfMonth(new Date()), $lte: endOfMonth(new Date()) },
 *   }
 */
messageSchema.index({
  _environmentId: 1,
  providerId: 1,
  createdAt: 1,
});

/*
 * This index was created to push entries to Online Archive
 */
messageSchema.index({ createdAt: 1 });

/**
 * todo: remove deleted field after all the soft deletes are removed task nv-5688
 */
messageSchema.index({ _environmentId: 1, _jobId: 1, deleted: 1 });

export const Message =
  (mongoose.models.Message as mongoose.Model<MessageDBModel>) ||
  mongoose.model<MessageDBModel>('Message', messageSchema);
