/* eslint-disable global-require */
import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { ChangeRepository } from '@novu/dal';
import { ChangeEntityTypeEnum } from '@novu/shared';

import { ModuleRef } from '@nestjs/core';
import { PinoLogger } from '@novu/application-generic';
import { ApplyChange, ApplyChangeCommand } from '../apply-change';
import { PromoteTypeChangeCommand } from '../promote-type-change.command';

@Injectable()
export class PromoteTranslationChange {
  constructor(
    private moduleRef: ModuleRef,
    @Inject(forwardRef(() => ApplyChange)) private applyChange: ApplyChange,
    private changeRepository: ChangeRepository,
    private logger: PinoLogger
  ) {
    this.logger.setContext(this.constructor.name);
  }

  async execute(command: PromoteTypeChangeCommand) {
    try {
      if (process.env.NOVU_ENTERPRISE === 'true' || process.env.CI_EE_TEST === 'true') {
        if (!require('@novu/ee-translation')?.PromoteTranslationChange) {
          throw new BadRequestException('Translation module is not loaded');
        }
        const usecase = this.moduleRef.get(require('@novu/ee-translation')?.PromoteTranslationChange, {
          strict: false,
        });
        await usecase.execute(command, this.applyGroupChange.bind(this));
      }
    } catch (e) {
      this.logger.error({ err: e }, `Unexpected error while importing enterprise modules`);
    }
  }

  private async applyGroupChange(command: PromoteTypeChangeCommand) {
    const newItem = command.item as {
      _groupId: string;
    };

    const changes = await this.changeRepository.getEntityChanges(
      command.organizationId,
      ChangeEntityTypeEnum.TRANSLATION_GROUP,
      newItem._groupId
    );

    for (const change of changes) {
      await this.applyChange.execute(
        ApplyChangeCommand.create({
          changeId: change._id,
          environmentId: change._environmentId,
          organizationId: change._organizationId,
          userId: command.userId,
        })
      );
    }
  }
}
