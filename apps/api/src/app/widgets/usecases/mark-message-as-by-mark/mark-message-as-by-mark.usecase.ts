import { Injectable, NotFoundException } from '@nestjs/common';

import { MessageEntity, MessageRepository, SubscriberEntity, SubscriberRepository } from '@novu/dal';
import { MessagesStatusEnum } from '@novu/shared';
import {
  AnalyticsService,
  buildFeedKey,
  buildMessageCountKey,
  buildSubscriberKey,
  CachedResponse,
  InvalidateCacheService,
  WebSocketsQueueService,
} from '@novu/application-generic';
import { MarkMessageAsByMarkCommand } from './mark-message-as-by-mark.command';
import { mapMarkMessageToWebSocketEvent } from '../../../shared/helpers';
import { MessageResponseDto } from '../../dtos/message-response.dto';

@Injectable()
export class MarkMessageAsByMark {
  constructor(
    private invalidateCache: InvalidateCacheService,
    private messageRepository: MessageRepository,
    private webSocketsQueueService: WebSocketsQueueService,
    private analyticsService: AnalyticsService,
    private subscriberRepository: SubscriberRepository
  ) {}

  async execute(command: MarkMessageAsByMarkCommand): Promise<MessageResponseDto[]> {
    const subscriber = await this.fetchSubscriber({
      _environmentId: command.environmentId,
      subscriberId: command.subscriberId,
    });

    if (!subscriber) throw new NotFoundException(`Subscriber ${command.subscriberId} not found`);

    await this.invalidateCache.invalidateQuery({
      key: buildFeedKey().invalidate({
        subscriberId: command.subscriberId,
        _environmentId: command.environmentId,
      }),
    });

    await this.invalidateCache.invalidateQuery({
      key: buildMessageCountKey().invalidate({
        subscriberId: command.subscriberId,
        _environmentId: command.environmentId,
      }),
    });

    await this.messageRepository.changeMessagesStatus({
      environmentId: command.environmentId,
      subscriberId: subscriber._id,
      messageIds: command.messageIds,
      markAs: command.markAs,
    });

    const messages: MessageEntity[] = await this.messageRepository.find({
      _environmentId: command.environmentId,
      _id: {
        $in: command.messageIds,
      },
    });

    await this.updateServices(command, subscriber, messages, command.markAs);

    return messages.map(mapMessageEntityToResponseDto);
  }

  private async updateServices(command: MarkMessageAsByMarkCommand, subscriber, messages, markAs: MessagesStatusEnum) {
    this.updateSocketCount(subscriber, markAs);
    const analyticMessage =
      command.__source === 'notification_center'
        ? `Mark as ${markAs} - [Notification Center]`
        : `Mark as ${markAs} - [API]`;

    for (const message of messages) {
      this.analyticsService.mixpanelTrack(analyticMessage, '', {
        _subscriber: message._subscriberId,
        _organization: command.organizationId,
        _template: message._templateId,
      });
    }
  }

  private updateSocketCount(subscriber: SubscriberEntity, markAs: MessagesStatusEnum) {
    const eventMessage = mapMarkMessageToWebSocketEvent(markAs);

    if (eventMessage === undefined) {
      return;
    }

    this.webSocketsQueueService.add({
      name: 'sendMessage',
      data: {
        event: eventMessage,
        userId: subscriber._id,
        _environmentId: subscriber._environmentId,
      },
      groupId: subscriber._organizationId,
    });
  }

  @CachedResponse({
    builder: (command: { subscriberId: string; _environmentId: string }) =>
      buildSubscriberKey({
        _environmentId: command._environmentId,
        subscriberId: command.subscriberId,
      }),
  })
  private async fetchSubscriber({
    subscriberId,
    _environmentId,
  }: {
    subscriberId: string;
    _environmentId: string;
  }): Promise<SubscriberEntity | null> {
    return await this.subscriberRepository.findBySubscriberId(_environmentId, subscriberId);
  }
}
export function mapMessageEntityToResponseDto(entity: MessageEntity): MessageResponseDto {
  const responseDto = new MessageResponseDto();

  responseDto._id = entity._id;
  responseDto._templateId = entity._templateId;
  responseDto._environmentId = entity._environmentId;
  responseDto._messageTemplateId = entity._messageTemplateId;
  responseDto._organizationId = entity._organizationId;
  responseDto._notificationId = entity._notificationId;
  responseDto._subscriberId = entity._subscriberId;
  responseDto.templateIdentifier = entity.templateIdentifier;
  responseDto.createdAt = entity.createdAt;
  responseDto.lastSeenDate = entity.lastSeenDate;
  responseDto.lastReadDate = entity.lastReadDate;
  responseDto.content = entity.content; // Assuming content can be directly assigned
  responseDto.transactionId = entity.transactionId;
  responseDto.subject = entity.subject;
  responseDto.channel = entity.channel;
  responseDto.read = entity.read;
  responseDto.seen = entity.seen;
  responseDto.snoozedUntil = entity.snoozedUntil;
  responseDto.deliveredAt = entity.deliveredAt; // snoozed notifications can have multiple delivery dates
  responseDto.email = entity.email;
  responseDto.phone = entity.phone;
  responseDto.directWebhookUrl = entity.directWebhookUrl;
  responseDto.providerId = entity.providerId;
  responseDto.deviceTokens = entity.deviceTokens;
  responseDto.title = entity.title;
  responseDto.cta = entity.cta; // Assuming cta can be directly assigned
  responseDto._feedId = entity._feedId ?? null; // Handle optional _feedId
  responseDto.status = entity.status;
  responseDto.errorId = entity.errorId;
  responseDto.errorText = entity.errorText;
  responseDto.payload = entity.payload;
  responseDto.overrides = entity.overrides;

  return responseDto;
}
