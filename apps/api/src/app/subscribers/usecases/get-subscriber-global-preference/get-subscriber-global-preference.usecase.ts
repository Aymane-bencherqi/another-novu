import { Injectable, NotFoundException } from '@nestjs/common';
import { SubscriberEntity, SubscriberRepository } from '@novu/dal';

import { ChannelTypeEnum, IPreferenceChannels } from '@novu/shared';
import {
  buildSubscriberKey,
  CachedResponse,
  filteredPreference,
  GetPreferences,
  Instrument,
  InstrumentUsecase,
} from '@novu/application-generic';
import { GetSubscriberGlobalPreferenceCommand } from './get-subscriber-global-preference.command';
import { GetSubscriberPreference } from '../get-subscriber-preference/get-subscriber-preference.usecase';

@Injectable()
export class GetSubscriberGlobalPreference {
  constructor(
    private subscriberRepository: SubscriberRepository,
    private getPreferences: GetPreferences,
    private getSubscriberPreference: GetSubscriberPreference
  ) {}

  @InstrumentUsecase()
  async execute(command: GetSubscriberGlobalPreferenceCommand) {
    const subscriber = await this.getSubscriber(command);

    const activeChannels = await this.getActiveChannels(command);

    const subscriberGlobalPreference = await this.getSubscriberGlobalPreference(command, subscriber._id);

    const channelsWithDefaults = this.buildDefaultPreferences(subscriberGlobalPreference.channels);

    let channels: IPreferenceChannels;
    if (command.includeInactiveChannels === true) {
      channels = channelsWithDefaults;
    } else {
      channels = filteredPreference(channelsWithDefaults, activeChannels);
    }

    return {
      preference: {
        enabled: subscriberGlobalPreference.enabled,
        channels,
      },
    };
  }

  @Instrument()
  private async getSubscriberGlobalPreference(
    command: GetSubscriberGlobalPreferenceCommand,
    subscriberId: string
  ): Promise<{
    channels: IPreferenceChannels;
    enabled: boolean;
  }> {
    const subscriberGlobalChannels = await this.getPreferences.getPreferenceChannels({
      environmentId: command.environmentId,
      organizationId: command.organizationId,
      subscriberId,
    });

    return {
      channels: subscriberGlobalChannels ?? {
        email: true,
        sms: true,
        in_app: true,
        chat: true,
        push: true,
      },
      enabled: true,
    };
  }

  @Instrument()
  private async getActiveChannels(command: GetSubscriberGlobalPreferenceCommand): Promise<ChannelTypeEnum[]> {
    const subscriberWorkflowPreferences = await this.getSubscriberPreference.execute(
      GetSubscriberGlobalPreferenceCommand.create({
        environmentId: command.environmentId,
        subscriberId: command.subscriberId,
        organizationId: command.organizationId,
        includeInactiveChannels: command.includeInactiveChannels,
      })
    );

    const activeChannels = new Set<ChannelTypeEnum>();
    subscriberWorkflowPreferences.forEach((subscriberWorkflowPreference) => {
      Object.keys(subscriberWorkflowPreference.preference.channels).forEach((channel) => {
        activeChannels.add(channel as ChannelTypeEnum);
      });
    });

    return Array.from(activeChannels);
  }

  @CachedResponse({
    builder: (command: { subscriberId: string; _environmentId: string }) =>
      buildSubscriberKey({
        _environmentId: command._environmentId,
        subscriberId: command.subscriberId,
      }),
  })
  private async getSubscriber(command: GetSubscriberGlobalPreferenceCommand): Promise<SubscriberEntity> {
    const subscriber = await this.subscriberRepository.findBySubscriberId(command.environmentId, command.subscriberId);

    if (!subscriber) {
      throw new NotFoundException(`Subscriber ${command.subscriberId} not found`);
    }

    return subscriber;
  }
  // adds default state for missing channels
  private buildDefaultPreferences(preference: IPreferenceChannels) {
    const defaultPreference: IPreferenceChannels = {
      email: true,
      sms: true,
      in_app: true,
      chat: true,
      push: true,
    };

    return { ...defaultPreference, ...preference };
  }
}
