/* eslint-disable global-require */
import { Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
  IntegrationEntity,
  JobEntity,
  MessageRepository,
  MessageTemplateEntity,
  SubscriberRepository,
} from '@novu/dal';
import {
  ChannelTypeEnum,
  EmailProviderIdEnum,
  ExecutionDetailsSourceEnum,
  ExecutionDetailsStatusEnum,
  ITenantDefine,
  ProvidersIdEnum,
  SmsProviderIdEnum,
} from '@novu/shared';
import { format } from 'date-fns';
import i18next from 'i18next';
import { merge } from 'lodash';

import {
  CreateExecutionDetails,
  CreateExecutionDetailsCommand,
  DetailEnum,
  GetNovuProviderCredentials,
  SelectIntegration,
  SelectIntegrationCommand,
  SelectVariant,
  SelectVariantCommand,
} from '@novu/application-generic';
import { PlatformException } from '../../../shared/utils';
import { SendMessageResult, SendMessageType } from './send-message-type.usecase';
import { SendMessageCommand } from './send-message.command';

export abstract class SendMessageBase extends SendMessageType {
  abstract readonly channelType: ChannelTypeEnum;
  protected constructor(
    protected messageRepository: MessageRepository,
    protected createExecutionDetails: CreateExecutionDetails,
    protected subscriberRepository: SubscriberRepository,
    protected selectIntegration: SelectIntegration,
    protected getNovuProviderCredentials: GetNovuProviderCredentials,
    protected selectVariant: SelectVariant,
    protected moduleRef: ModuleRef
  ) {
    super(messageRepository, createExecutionDetails);
  }

  protected combineOverrides(
    bridgeData: Record<string, any> | null | undefined,
    overrides: Record<string, any> | undefined,
    stepId: string | undefined,
    integrationId: string
  ): Record<string, unknown> {
    const bridgeProviderData = bridgeData?.providers?.[integrationId] || {};
    const workflowGlobalProviderOverrides = overrides?.providers?.[integrationId] || {};
    const triggerOverrides = stepId ? overrides?.steps?.[stepId]?.providers[integrationId] || {} : {};

    return merge({}, bridgeProviderData, workflowGlobalProviderOverrides, triggerOverrides);
  }

  protected async getIntegration(params: {
    id?: string;
    providerId?: ProvidersIdEnum;
    identifier?: string;
    organizationId: string;
    environmentId: string;
    channelType: ChannelTypeEnum;
    userId: string;
    recipientEmail?: string;
    filterData: {
      tenant: ITenantDefine | undefined;
    };
  }): Promise<IntegrationEntity | undefined> {
    const integration = await this.selectIntegration.execute(SelectIntegrationCommand.create(params));

    if (!integration) {
      return;
    }

    if (integration.providerId === EmailProviderIdEnum.Novu || integration.providerId === SmsProviderIdEnum.Novu) {
      integration.credentials = await this.getNovuProviderCredentials.execute({
        channelType: integration.channel,
        providerId: integration.providerId,
        environmentId: integration._environmentId,
        organizationId: integration._organizationId,
        userId: params.userId,
        recipientEmail: params.recipientEmail,
      });
    }

    return integration;
  }

  protected storeContent(): boolean {
    return this.channelType === ChannelTypeEnum.IN_APP || process.env.STORE_NOTIFICATION_CONTENT === 'true';
  }

  protected getCompilePayload(compileContext) {
    const { payload, ...rest } = compileContext;

    return { ...payload, ...rest };
  }

  protected async sendErrorHandlebars(job: JobEntity, error: string): Promise<SendMessageResult> {
    await this.createExecutionDetails.execute(
      CreateExecutionDetailsCommand.create({
        ...CreateExecutionDetailsCommand.getDetailsFromJob(job),
        detail: DetailEnum.MESSAGE_CONTENT_NOT_GENERATED,
        source: ExecutionDetailsSourceEnum.INTERNAL,
        status: ExecutionDetailsStatusEnum.FAILED,
        isTest: false,
        isRetry: false,
        raw: JSON.stringify({ error }),
      })
    );

    return {
      status: 'failed',
      reason: DetailEnum.MESSAGE_CONTENT_NOT_GENERATED,
    };
  }

  protected async sendSelectedIntegrationExecution(job: JobEntity, integration: IntegrationEntity) {
    await this.createExecutionDetails.execute(
      CreateExecutionDetailsCommand.create({
        ...CreateExecutionDetailsCommand.getDetailsFromJob(job),
        detail: DetailEnum.INTEGRATION_INSTANCE_SELECTED,
        source: ExecutionDetailsSourceEnum.INTERNAL,
        status: ExecutionDetailsStatusEnum.PENDING,
        isTest: false,
        isRetry: false,
        raw: JSON.stringify({
          providerId: integration?.providerId,
          identifier: integration?.identifier,
          name: integration?.name,
          _environmentId: integration?._environmentId,
          _id: integration?._id,
        }),
      })
    );
  }

  protected async processVariants(command: SendMessageCommand): Promise<MessageTemplateEntity> {
    const { messageTemplate, conditions } = await this.selectVariant.execute(
      SelectVariantCommand.create({
        organizationId: command.organizationId,
        environmentId: command.environmentId,
        userId: command.userId,
        step: command.step,
        job: command.job,
        filterData: command.compileContext ?? {},
      })
    );

    if (conditions) {
      await this.createExecutionDetails.execute(
        CreateExecutionDetailsCommand.create({
          ...CreateExecutionDetailsCommand.getDetailsFromJob(command.job),
          detail: DetailEnum.VARIANT_CHOSEN,
          source: ExecutionDetailsSourceEnum.INTERNAL,
          status: ExecutionDetailsStatusEnum.PENDING,
          isTest: false,
          isRetry: false,
          raw: JSON.stringify({ conditions }),
        })
      );
    }

    return messageTemplate;
  }

  protected async initiateTranslations(environmentId: string, organizationId: string, locale: string | undefined) {
    try {
      if (process.env.NOVU_ENTERPRISE === 'true' || process.env.CI_EE_TEST === 'true') {
        if (!require('@novu/ee-shared-services')?.TranslationsService) {
          throw new PlatformException('Translation module is not loaded');
        }
        const service = this.moduleRef.get(require('@novu/ee-shared-services')?.TranslationsService, { strict: false });
        const { namespaces, resources, defaultLocale } = await service.getTranslationsList(
          environmentId,
          organizationId
        );

        const instance = i18next.createInstance({
          resources,
          ns: namespaces,
          defaultNS: false,
          nsSeparator: '.',
          lng: locale || 'en',
          compatibilityJSON: 'v2',
          fallbackLng: defaultLocale || 'en',
          interpolation: {
            formatSeparator: ',',
            format(value, formatting, lng) {
              if (value && formatting && !Number.isNaN(Date.parse(value))) {
                return format(new Date(value), formatting);
              }

              return value.toString();
            },
          },
        });

        await instance.init();

        return instance;
      }
    } catch (e) {
      Logger.error(e, `Unexpected error while importing enterprise modules`, 'TranslationsService');
    }
  }
}
