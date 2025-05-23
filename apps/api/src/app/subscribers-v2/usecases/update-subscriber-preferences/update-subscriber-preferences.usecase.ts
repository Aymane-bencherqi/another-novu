import { plainToInstance } from 'class-transformer';
import { Injectable } from '@nestjs/common';
import { PreferenceLevelEnum } from '@novu/shared';
import { GetWorkflowByIdsCommand, GetWorkflowByIdsUseCase } from '@novu/application-generic';

import { UpdateSubscriberPreferencesCommand } from './update-subscriber-preferences.command';
import { UpdatePreferences } from '../../../inbox/usecases/update-preferences/update-preferences.usecase';
import { UpdatePreferencesCommand } from '../../../inbox/usecases/update-preferences/update-preferences.command';
import { GetSubscriberPreferences } from '../get-subscriber-preferences/get-subscriber-preferences.usecase';

import { GetSubscriberPreferencesDto } from '../../dtos/get-subscriber-preferences.dto';

@Injectable()
export class UpdateSubscriberPreferences {
  constructor(
    private updatePreferencesUsecase: UpdatePreferences,
    private getSubscriberPreferences: GetSubscriberPreferences,
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase
  ) {}

  async execute(command: UpdateSubscriberPreferencesCommand): Promise<GetSubscriberPreferencesDto> {
    let workflowId: string | undefined;
    if (command.workflowIdOrInternalId) {
      const workflowEntity = await this.getWorkflowByIdsUseCase.execute(
        GetWorkflowByIdsCommand.create({
          environmentId: command.environmentId,
          organizationId: command.organizationId,
          workflowIdOrInternalId: command.workflowIdOrInternalId,
        })
      );
      workflowId = workflowEntity._id;
    }

    await this.updatePreferencesUsecase.execute(
      UpdatePreferencesCommand.create({
        organizationId: command.organizationId,
        environmentId: command.environmentId,
        subscriberId: command.subscriberId,
        level: command.workflowIdOrInternalId ? PreferenceLevelEnum.TEMPLATE : PreferenceLevelEnum.GLOBAL,
        workflowIdOrIdentifier: workflowId,
        includeInactiveChannels: false,
        ...command.channels,
      })
    );

    const subscriberPreferences = await this.getSubscriberPreferences.execute({
      environmentId: command.environmentId,
      organizationId: command.organizationId,
      subscriberId: command.subscriberId,
    });

    return plainToInstance(GetSubscriberPreferencesDto, {
      global: subscriberPreferences.global,
      workflows: subscriberPreferences.workflows,
    });
  }
}
