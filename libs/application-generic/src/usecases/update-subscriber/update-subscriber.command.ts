import { IsEmail, IsLocale, IsOptional, IsString } from 'class-validator';
import { SubscriberEntity } from '@novu/dal';
import { ISubscriberChannel, SubscriberCustomData } from '@novu/shared';
import { Transform } from 'class-transformer';

import { EnvironmentCommand } from '../../commands';

export class UpdateSubscriberCommand extends EnvironmentCommand {
  @IsString()
  subscriberId: string;

  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @Transform((params) => (params.value === '' ? null : params.value))
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsLocale()
  @IsOptional()
  locale?: string;

  @IsOptional()
  timezone?: string;

  @IsOptional()
  data?: SubscriberCustomData;

  @IsOptional()
  subscriber?: SubscriberEntity;

  @IsOptional()
  channels?: ISubscriberChannel[];
}
