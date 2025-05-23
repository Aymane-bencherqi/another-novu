import { Injectable } from '@nestjs/common';
import { addBreadcrumb } from '@sentry/node';
import { ModuleRef } from '@nestjs/core';

import { MessageRepository, SubscriberRepository, MessageEntity, IntegrationEntity } from '@novu/dal';
import { ChannelTypeEnum, LogCodeEnum, ExecutionDetailsSourceEnum, ExecutionDetailsStatusEnum } from '@novu/shared';
import {
  InstrumentUsecase,
  DetailEnum,
  SelectIntegration,
  CompileTemplate,
  CompileTemplateCommand,
  SmsFactory,
  GetNovuProviderCredentials,
  SelectVariant,
  CreateExecutionDetails,
  CreateExecutionDetailsCommand,
} from '@novu/application-generic';
import { SmsOutput } from '@novu/framework/internal';

import { SendMessageCommand } from './send-message.command';
import { SendMessageBase } from './send-message.base';
import { PlatformException } from '../../../shared/utils';
import { SendMessageResult } from './send-message-type.usecase';

@Injectable()
export class SendMessageSms extends SendMessageBase {
  channelType = ChannelTypeEnum.SMS;

  constructor(
    protected subscriberRepository: SubscriberRepository,
    protected messageRepository: MessageRepository,
    protected createExecutionDetails: CreateExecutionDetails,
    private compileTemplate: CompileTemplate,
    protected selectIntegration: SelectIntegration,
    protected getNovuProviderCredentials: GetNovuProviderCredentials,
    protected selectVariant: SelectVariant,
    protected moduleRef: ModuleRef
  ) {
    super(
      messageRepository,
      createExecutionDetails,
      subscriberRepository,
      selectIntegration,
      getNovuProviderCredentials,
      selectVariant,
      moduleRef
    );
  }

  @InstrumentUsecase()
  public async execute(command: SendMessageCommand): Promise<SendMessageResult> {
    const overrideSelectedIntegration = command.overrides?.sms?.integrationIdentifier;

    const integration = await this.getIntegration({
      organizationId: command.organizationId,
      environmentId: command.environmentId,
      channelType: ChannelTypeEnum.SMS,
      userId: command.userId,
      identifier: overrideSelectedIntegration as string,
      filterData: {
        tenant: command.job.tenant,
      },
    });

    addBreadcrumb({
      message: 'Sending SMS',
    });

    const { step } = command;

    if (!step.template) throw new PlatformException(`Unexpected error: SMS template is missing`);

    const { subscriber } = command.compileContext;
    const template = await this.processVariants(command);
    const i18nInstance = await this.initiateTranslations(
      command.environmentId,
      command.organizationId,
      subscriber.locale
    );

    if (template) {
      step.template = template;
    }

    const bridgeOutput = command.bridgeData?.outputs as SmsOutput | undefined;
    let content: string = bridgeOutput?.body || '';

    try {
      if (!command.bridgeData) {
        content = await this.compileTemplate.execute(
          CompileTemplateCommand.create({
            template: step.template.content as string,
            data: this.getCompilePayload(command.compileContext),
          }),
          i18nInstance
        );

        if (!content) {
          throw new PlatformException(`Unexpected error: SMS content is missing`);
        }
      }
    } catch (e) {
      await this.sendErrorHandlebars(command.job, e.message);

      return {
        status: 'failed',
        reason: DetailEnum.MESSAGE_CONTENT_NOT_GENERATED,
      };
    }

    const phone = command.payload.phone || subscriber.phone;

    if (!integration) {
      await this.createExecutionDetails.execute(
        CreateExecutionDetailsCommand.create({
          ...CreateExecutionDetailsCommand.getDetailsFromJob(command.job),
          detail: DetailEnum.SUBSCRIBER_NO_ACTIVE_INTEGRATION,
          source: ExecutionDetailsSourceEnum.INTERNAL,
          status: ExecutionDetailsStatusEnum.FAILED,
          isTest: false,
          isRetry: false,
          ...(overrideSelectedIntegration
            ? {
                raw: JSON.stringify({
                  integrationIdentifier: overrideSelectedIntegration,
                }),
              }
            : {}),
        })
      );

      return {
        status: 'failed',
        reason: DetailEnum.SUBSCRIBER_NO_ACTIVE_INTEGRATION,
      };
    }

    await this.sendSelectedIntegrationExecution(command.job, integration);

    const overrides = {
      ...(command.overrides[integration?.channel] || {}),
      ...(command.overrides[integration?.providerId] || {}),
    };

    const messagePayload = { ...command.payload };
    delete messagePayload.attachments;

    const message: MessageEntity = await this.messageRepository.create({
      _notificationId: command.notificationId,
      _environmentId: command.environmentId,
      _organizationId: command.organizationId,
      _subscriberId: command._subscriberId,
      _templateId: command._templateId,
      _messageTemplateId: step.template._id,
      channel: ChannelTypeEnum.SMS,
      transactionId: command.transactionId,
      phone,
      content: this.storeContent() ? content : null,
      providerId: integration?.providerId,
      payload: messagePayload,
      overrides,
      templateIdentifier: command.identifier,
      _jobId: command.jobId,
      tags: command.tags,
    });

    await this.createExecutionDetails.execute(
      CreateExecutionDetailsCommand.create({
        ...CreateExecutionDetailsCommand.getDetailsFromJob(command.job),
        detail: DetailEnum.MESSAGE_CREATED,
        source: ExecutionDetailsSourceEnum.INTERNAL,
        status: ExecutionDetailsStatusEnum.PENDING,
        messageId: message._id,
        isTest: false,
        isRetry: false,
        raw: this.storeContent() ? JSON.stringify(messagePayload) : null,
      })
    );

    if (!phone || !integration) {
      return await this.sendErrors(phone, integration, message, command);
    }

    return await this.sendMessage(phone, integration, content, message, command, overrides);
  }

  private async sendErrors(
    phone,
    integration,
    message: MessageEntity,
    command: SendMessageCommand
  ): Promise<SendMessageResult> {
    if (!phone) {
      await this.messageRepository.updateMessageStatus(
        command.environmentId,
        message._id,
        'warning',
        null,
        'no_subscriber_phone',
        'Subscriber does not have active phone'
      );

      await this.createExecutionDetails.execute(
        CreateExecutionDetailsCommand.create({
          ...CreateExecutionDetailsCommand.getDetailsFromJob(command.job),
          messageId: message._id,
          detail: DetailEnum.SUBSCRIBER_NO_CHANNEL_DETAILS,
          source: ExecutionDetailsSourceEnum.INTERNAL,
          status: ExecutionDetailsStatusEnum.FAILED,
          isTest: false,
          isRetry: false,
        })
      );

      return {
        status: 'failed',
        reason: DetailEnum.SUBSCRIBER_NO_CHANNEL_DETAILS,
      };
    }
    if (!integration) {
      await this.sendErrorStatus(
        message,
        'warning',
        'sms_missing_integration_error',
        'Subscriber does not have an active sms integration',
        command
      );

      await this.createExecutionDetails.execute(
        CreateExecutionDetailsCommand.create({
          ...CreateExecutionDetailsCommand.getDetailsFromJob(command.job),
          messageId: message._id,
          detail: DetailEnum.SUBSCRIBER_NO_ACTIVE_INTEGRATION,
          source: ExecutionDetailsSourceEnum.INTERNAL,
          status: ExecutionDetailsStatusEnum.FAILED,
          isTest: false,
          isRetry: false,
        })
      );

      return {
        status: 'failed',
        reason: DetailEnum.SUBSCRIBER_NO_ACTIVE_INTEGRATION,
      };
    }
    if (!integration?.credentials?.from) {
      await this.sendErrorStatus(
        message,
        'warning',
        'no_integration_from_phone',
        'Integration does not have from phone configured',
        command
      );

      await this.createExecutionDetails.execute(
        CreateExecutionDetailsCommand.create({
          ...CreateExecutionDetailsCommand.getDetailsFromJob(command.job),
          messageId: message._id,
          detail: DetailEnum.SUBSCRIBER_NO_ACTIVE_CHANNEL,
          source: ExecutionDetailsSourceEnum.INTERNAL,
          status: ExecutionDetailsStatusEnum.FAILED,
          isTest: false,
          isRetry: false,
        })
      );

      return {
        status: 'failed',
        reason: DetailEnum.SUBSCRIBER_NO_ACTIVE_CHANNEL,
      };
    }

    return {
      status: 'failed',
      reason: DetailEnum.PROVIDER_ERROR,
    };
  }

  private async sendMessage(
    phone: string,
    integration: IntegrationEntity,
    content: string,
    message: MessageEntity,
    command: SendMessageCommand,
    overrides: Record<string, any> = {}
  ): Promise<SendMessageResult> {
    try {
      const bridgeBody = command.bridgeData?.outputs.body;

      const smsFactory = new SmsFactory();
      const smsHandler = smsFactory.getHandler(this.buildFactoryIntegration(integration));
      if (!smsHandler) {
        throw new PlatformException(`Sms handler for provider ${integration.providerId} is  not found`);
      }

      const result = await smsHandler.send({
        to: overrides.to || phone,
        from: overrides.from || integration.credentials.from,
        content: bridgeBody || overrides.content || content,
        id: message._id,
        customData: overrides.customData || {},
        bridgeProviderData: this.combineOverrides(
          command.bridgeData,
          command.overrides,
          command.step.stepId,
          integration.providerId
        ),
      });

      await this.createExecutionDetails.execute(
        CreateExecutionDetailsCommand.create({
          ...CreateExecutionDetailsCommand.getDetailsFromJob(command.job),
          messageId: message._id,
          detail: DetailEnum.MESSAGE_SENT,
          source: ExecutionDetailsSourceEnum.INTERNAL,
          status: ExecutionDetailsStatusEnum.SUCCESS,
          isTest: false,
          isRetry: false,
          raw: JSON.stringify(result),
        })
      );

      if (!result?.id) {
        return {
          status: 'failed',
          reason: DetailEnum.PROVIDER_ERROR,
        };
      }

      await this.messageRepository.update(
        { _environmentId: command.environmentId, _id: message._id },
        {
          $set: {
            identifier: result.id,
          },
        }
      );

      return {
        status: 'success',
      };
    } catch (e) {
      await this.sendErrorStatus(
        message,
        'error',
        'unexpected_sms_error',
        e.message || e.name || 'Un-expect SMS provider error',
        command,
        e
      );

      await this.createExecutionDetails.execute(
        CreateExecutionDetailsCommand.create({
          ...CreateExecutionDetailsCommand.getDetailsFromJob(command.job),
          messageId: message._id,
          detail: DetailEnum.PROVIDER_ERROR,
          source: ExecutionDetailsSourceEnum.INTERNAL,
          status: ExecutionDetailsStatusEnum.FAILED,
          isTest: false,
          isRetry: false,
          raw: JSON.stringify({ message: e?.response?.data || e.message, name: e.name }),
        })
      );

      return {
        status: 'failed',
        reason: DetailEnum.PROVIDER_ERROR,
      };
    }
  }

  public buildFactoryIntegration(integration: IntegrationEntity, senderName?: string) {
    return {
      ...integration,
      providerId: integration.providerId,
    };
  }
}
