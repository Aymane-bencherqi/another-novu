import { ChannelTypeEnum } from '@novu/shared';
import { IsArray, IsEnum, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { EnvironmentWithUserCommand } from '../../../shared/commands/project.command';

export class GetActivityFeedCommand extends EnvironmentWithUserCommand {
  @IsNumber()
  page: number;

  @IsNumber()
  limit: number;

  @IsOptional()
  @IsEnum(ChannelTypeEnum, {
    each: true,
  })
  channels?: ChannelTypeEnum[] | null;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  templates?: string[] | null;

  @IsOptional()
  @IsArray()
  emails?: string[];

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  subscriberIds?: string[];

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  topicKey?: string;

  @IsOptional()
  @IsString()
  after?: string;

  @IsOptional()
  @IsString()
  before?: string;
}
