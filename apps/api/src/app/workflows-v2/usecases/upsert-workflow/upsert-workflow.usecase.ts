import { BadRequestException, Injectable, Optional } from '@nestjs/common';

import {
  AnalyticsService,
  CreateWorkflow as CreateWorkflowV0Usecase,
  CreateWorkflowCommand,
  GetWorkflowByIdsCommand,
  GetWorkflowByIdsUseCase,
  Instrument,
  InstrumentUsecase,
  NotificationStep,
  shortId,
  UpdateWorkflow as UpdateWorkflowV0Usecase,
  UpdateWorkflowCommand,
  UpsertControlValuesCommand,
  UpsertControlValuesUseCase,
  SendWebhookMessage,
} from '@novu/application-generic';
import {
  ControlSchemas,
  ControlValuesRepository,
  NotificationGroupRepository,
  NotificationStepEntity,
  NotificationTemplateEntity,
} from '@novu/dal';
import {
  ControlValuesLevelEnum,
  DEFAULT_WORKFLOW_PREFERENCES,
  slugify,
  WebhookEventEnum,
  WebhookObjectTypeEnum,
  WorkflowCreationSourceEnum,
  WorkflowOriginEnum,
  WorkflowTypeEnum,
} from '@novu/shared';

import { stepTypeToControlSchema } from '../../shared';
import { computeWorkflowStatus } from '../../shared/compute-workflow-status';
import { BuildStepIssuesUsecase } from '../build-step-issues/build-step-issues.usecase';
import { GetWorkflowCommand, GetWorkflowUseCase } from '../get-workflow';
import { UpsertStepDataCommand, UpsertWorkflowCommand } from './upsert-workflow.command';
import { StepIssuesDto, WorkflowResponseDto } from '../../dtos';

@Injectable()
export class UpsertWorkflowUseCase {
  constructor(
    private createWorkflowV0Usecase: CreateWorkflowV0Usecase,
    private updateWorkflowV0Usecase: UpdateWorkflowV0Usecase,
    private notificationGroupRepository: NotificationGroupRepository,
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    private getWorkflowUseCase: GetWorkflowUseCase,
    private buildStepIssuesUsecase: BuildStepIssuesUsecase,
    private controlValuesRepository: ControlValuesRepository,
    private upsertControlValuesUseCase: UpsertControlValuesUseCase,
    private analyticsService: AnalyticsService,
    @Optional()
    private sendWebhookMessage?: SendWebhookMessage
  ) {}

  @InstrumentUsecase()
  async execute(command: UpsertWorkflowCommand): Promise<WorkflowResponseDto> {
    // TODO: use transaction to ensure that the workflows, steps and controls are upserted atomically

    const existingWorkflow = command.workflowIdOrInternalId
      ? await this.getWorkflowByIdsUseCase.execute(
          GetWorkflowByIdsCommand.create({
            environmentId: command.user.environmentId,
            organizationId: command.user.organizationId,
            workflowIdOrInternalId: command.workflowIdOrInternalId,
          })
        )
      : null;

    let upsertedWorkflow: NotificationTemplateEntity;

    if (existingWorkflow) {
      this.mixpanelTrack(command, 'Workflow Update - [API]');

      upsertedWorkflow = await this.updateWorkflowV0Usecase.execute(
        UpdateWorkflowCommand.create(await this.buildUpdateWorkflowCommand(command, existingWorkflow))
      );
    } else {
      this.mixpanelTrack(command, 'Workflow Created - [API]');

      upsertedWorkflow = await this.createWorkflowV0Usecase.execute(
        CreateWorkflowCommand.create(await this.buildCreateWorkflowCommand(command))
      );
    }

    await this.upsertControlValues(upsertedWorkflow, command);

    const updatedWorkflow = await this.getWorkflowUseCase.execute(
      GetWorkflowCommand.create({
        workflowIdOrInternalId: upsertedWorkflow._id,
        user: command.user,
      })
    );

    if (this.sendWebhookMessage) {
      if (existingWorkflow) {
        await this.sendWebhookMessage.execute({
          eventType: WebhookEventEnum.WORKFLOW_UPDATED,
          objectType: WebhookObjectTypeEnum.WORKFLOW,
          payload: {
            object: updatedWorkflow as unknown as Record<string, unknown>,
            previousObject: existingWorkflow as unknown as Record<string, unknown>,
          },
          organizationId: command.user.organizationId,
          environmentId: command.user.environmentId,
        });
      } else {
        await this.sendWebhookMessage.execute({
          eventType: WebhookEventEnum.WORKFLOW_CREATED,
          objectType: WebhookObjectTypeEnum.WORKFLOW,
          payload: {
            object: updatedWorkflow as unknown as Record<string, unknown>,
          },
          organizationId: command.user.organizationId,
          environmentId: command.user.environmentId,
        });
      }
    }

    return updatedWorkflow;
  }

  private async buildCreateWorkflowCommand(command: UpsertWorkflowCommand): Promise<CreateWorkflowCommand> {
    const { user, workflowDto, preserveWorkflowId } = command;
    const isWorkflowActive = workflowDto?.active ?? true;
    const notificationGroupId = await this.getNotificationGroup(command.user.environmentId);

    if (!notificationGroupId) {
      throw new BadRequestException('Notification group not found');
    }
    const steps = await this.buildSteps(command);

    return {
      notificationGroupId,
      environmentId: user.environmentId,
      organizationId: user.organizationId,
      userId: user._id,
      name: workflowDto.name,
      __source: workflowDto.__source || WorkflowCreationSourceEnum.DASHBOARD,
      type: WorkflowTypeEnum.BRIDGE,
      origin: WorkflowOriginEnum.NOVU_CLOUD,
      steps,
      active: isWorkflowActive,
      description: workflowDto.description || '',
      tags: workflowDto.tags || [],
      userPreferences: workflowDto.preferences?.user ?? null,
      defaultPreferences: workflowDto.preferences?.workflow ?? DEFAULT_WORKFLOW_PREFERENCES,
      triggerIdentifier: preserveWorkflowId ? workflowDto.workflowId : slugify(workflowDto.name),
      status: computeWorkflowStatus(isWorkflowActive, steps),
    };
  }

  private async buildUpdateWorkflowCommand(
    command: UpsertWorkflowCommand,
    existingWorkflow: NotificationTemplateEntity
  ): Promise<UpdateWorkflowCommand> {
    const { workflowDto, user } = command;
    const steps = await this.buildSteps(command, existingWorkflow);
    const workflowActive = workflowDto.active ?? true;

    return {
      id: existingWorkflow._id,
      environmentId: existingWorkflow._environmentId,
      organizationId: user.organizationId,
      userId: user._id,
      name: workflowDto.name,
      steps,
      rawData: workflowDto as unknown as Record<string, unknown>,
      type: WorkflowTypeEnum.BRIDGE,
      description: workflowDto.description,
      userPreferences: workflowDto.preferences?.user ?? null,
      defaultPreferences: workflowDto.preferences?.workflow ?? DEFAULT_WORKFLOW_PREFERENCES,
      tags: workflowDto.tags,
      active: workflowActive,
      status: computeWorkflowStatus(workflowActive, steps),
    };
  }

  private async buildSteps(
    command: UpsertWorkflowCommand,
    existingWorkflow?: NotificationTemplateEntity
  ): Promise<NotificationStep[]> {
    const steps: NotificationStep[] = [];

    for (const step of command.workflowDto.steps) {
      const existingStep: NotificationStepEntity | null | undefined =
        // eslint-disable-next-line id-length
        '_id' in step ? existingWorkflow?.steps.find((s) => !!step._id && s._templateId === step._id) : null;

      const {
        user,
        workflowDto: { origin: workflowOrigin },
      } = command;

      const controlSchemas: ControlSchemas = existingStep?.template?.controls || stepTypeToControlSchema[step.type];
      const issues: StepIssuesDto = await this.buildStepIssuesUsecase.execute({
        workflowOrigin,
        user,
        stepInternalId: existingStep?._id,
        workflow: existingWorkflow,
        stepType: step.type,
        controlSchema: controlSchemas.schema,
        controlsDto: step.controlValues,
      });

      const updateStepId = existingStep?.stepId;
      const syncToEnvironmentCreateStepId = step.stepId;
      const finalStep = {
        template: {
          type: step.type,
          name: step.name,
          controls: controlSchemas,
          content: '',
        },
        stepId:
          updateStepId ||
          syncToEnvironmentCreateStepId ||
          this.generateUniqueStepId(step, existingWorkflow ? existingWorkflow.steps : command.workflowDto.steps),
        name: step.name,
        issues,
      };

      if (existingStep) {
        Object.assign(finalStep, {
          _id: existingStep._templateId,
          _templateId: existingStep._templateId,
          template: { ...finalStep.template, _id: existingStep._templateId },
        });
      }

      steps.push(finalStep);
    }

    return steps;
  }

  private generateUniqueStepId(step: UpsertStepDataCommand, previousSteps: NotificationStep[]): string {
    const slug = slugify(step.name);

    let finalStepId = slug;
    let attempts = 0;
    const maxAttempts = 5;

    const previousStepIds = previousSteps.reduce<string[]>((acc, { stepId }) => {
      if (stepId) {
        acc.push(stepId);
      }

      return acc;
    }, []);

    const isStepIdUnique = (stepId: string) => !previousStepIds.includes(stepId);

    while (attempts < maxAttempts) {
      if (isStepIdUnique(finalStepId)) {
        break;
      }

      finalStepId = `${slug}-${shortId()}`;
      attempts += 1;
    }

    if (attempts === maxAttempts && !isStepIdUnique(finalStepId)) {
      throw new BadRequestException({
        message: 'Failed to generate unique stepId',
        stepId: finalStepId,
      });
    }

    return finalStepId;
  }

  private async getNotificationGroup(environmentId: string): Promise<string | undefined> {
    return (
      await this.notificationGroupRepository.findOne(
        {
          name: 'General',
          _environmentId: environmentId,
        },
        '_id'
      )
    )?._id;
  }

  @Instrument()
  private async upsertControlValues(
    updatedWorkflow: NotificationTemplateEntity,
    command: UpsertWorkflowCommand
  ): Promise<void> {
    const controlValuesUpdates = this.getControlValuesUpdates(updatedWorkflow.steps, command);
    if (controlValuesUpdates.length === 0) return;

    await Promise.all(
      controlValuesUpdates.map((update) => this.executeControlValuesUpdate(update, updatedWorkflow._id, command))
    );
  }

  private getControlValuesUpdates(updatedSteps: NotificationStepEntity[], command: UpsertWorkflowCommand) {
    return updatedSteps
      .map((step) => {
        const controlValues = this.findControlValueInRequest(step, command.workflowDto.steps);
        if (controlValues === undefined) return null;

        return {
          step,
          controlValues,
          shouldDelete: controlValues === null,
        };
      })
      .filter((update): update is NonNullable<typeof update> => update !== null);
  }

  private executeControlValuesUpdate(
    update: { step: NotificationStepEntity; controlValues: Record<string, unknown> | null; shouldDelete: boolean },
    workflowId: string,
    command: UpsertWorkflowCommand
  ) {
    if (update.shouldDelete) {
      return this.controlValuesRepository.delete({
        _environmentId: command.user.environmentId,
        _organizationId: command.user.organizationId,
        _workflowId: workflowId,
        _stepId: update.step._templateId,
        level: ControlValuesLevelEnum.STEP_CONTROLS,
      });
    }

    return this.upsertControlValuesUseCase.execute(
      UpsertControlValuesCommand.create({
        organizationId: command.user.organizationId,
        environmentId: command.user.environmentId,
        notificationStepEntity: update.step,
        workflowId,
        newControlValues: update.controlValues || {},
      })
    );
  }

  private findControlValueInRequest(
    updatedStep: NotificationStepEntity,
    commandSteps: UpsertStepDataCommand[]
  ): Record<string, unknown> | undefined | null {
    const commandStep = commandSteps.find((commandStepX) => {
      const isStepUpdateDashboardDto = '_id' in commandStepX;
      if (isStepUpdateDashboardDto) {
        return commandStepX._id === updatedStep._templateId;
      }

      const isCreateBySyncToEnvironment = 'stepId' in commandStepX;
      if (isCreateBySyncToEnvironment) {
        return commandStepX.stepId === updatedStep.stepId;
      }

      return commandStepX.name === updatedStep.name;
    });

    if (!commandStep) return null;

    return commandStep.controlValues;
  }

  private mixpanelTrack(command: UpsertWorkflowCommand, eventName: string) {
    this.analyticsService.mixpanelTrack(eventName, command.user?._id, {
      _organization: command.user.organizationId,
      name: command.workflowDto.name,
      tags: command.workflowDto.tags || [],
      origin: command.workflowDto.origin,
      source: command.workflowDto.__source,
    });
  }
}
