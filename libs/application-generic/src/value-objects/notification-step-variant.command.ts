import { IStepVariant, IWorkflowStepMetadata } from '@novu/shared';
import { IsArray, IsBoolean, IsMongoId, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { StepIssues } from './step.issues';
import { IStepControl } from './i-step.control';
import { MessageFilter } from './message.filter';

export class NotificationStepVariantCommand implements IStepVariant {
  @IsString()
  @IsOptional()
  _templateId?: string;

  @ValidateNested()
  @IsOptional()
  template?: any;

  @IsOptional()
  uuid?: string;

  @IsOptional()
  name?: string;

  @IsBoolean()
  active?: boolean;

  @IsBoolean()
  shouldStopOnFail?: boolean;

  @ValidateNested()
  @IsOptional()
  replyCallback?: {
    active: boolean;
    url: string;
  };

  @IsOptional()
  @IsArray()
  @ValidateNested()
  filters?: MessageFilter[];

  @IsMongoId()
  @IsOptional()
  _id?: string;

  @IsOptional()
  metadata?: IWorkflowStepMetadata;

  @IsOptional()
  output?: IStepControl;

  @IsOptional()
  stepId?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => StepIssues)
  issues?: StepIssues;
}
