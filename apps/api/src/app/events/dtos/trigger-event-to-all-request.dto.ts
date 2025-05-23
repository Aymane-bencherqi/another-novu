import { IsDefined, IsObject, IsOptional, IsString, ValidateIf, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import { TriggerRecipientSubscriber, TriggerTenantContext } from '@novu/shared';

import { SubscriberPayloadDto, TenantPayloadDto, TriggerOverrides } from './trigger-event-request.dto';

export class TriggerEventToAllRequestDto {
  @ApiProperty({
    description:
      'The trigger identifier associated for the template you wish to send. This identifier can be found on the template page.',
  })
  @IsString()
  @IsDefined()
  name: string;

  @ApiProperty({
    example: {
      comment_id: 'string',
      post: {
        text: 'string',
      },
    },
    type: 'object',
    description: `The payload object is used to pass additional information that 
    could be used to render the template, or perform routing rules based on it. 
      For In-App channel, payload data are also available in <Inbox />`,
    required: true,
    additionalProperties: true,
  })
  @IsObject()
  payload: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'This could be used to override provider specific configurations',
    example: {
      fcm: {
        data: {
          key: 'value',
        },
      },
    },
    type: TriggerOverrides,
    additionalProperties: {
      type: 'object',
      additionalProperties: true,
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  overrides?: TriggerOverrides;

  @ApiProperty({
    description: 'A unique identifier for this transaction, we will generated a UUID if not provided.',
  })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiProperty({
    description: `It is used to display the Avatar of the provided actor's subscriber id or actor object.
    If a new actor object is provided, we will create a new subscriber in our system
    `,
    oneOf: [
      { type: 'string', description: 'Unique identifier of a subscriber in your systems' },
      { $ref: getSchemaPath(SubscriberPayloadDto) },
    ],
  })
  @IsOptional()
  @ValidateIf((_, value) => typeof value !== 'string')
  @ValidateNested()
  @Type(() => SubscriberPayloadDto)
  actor?: TriggerRecipientSubscriber;

  @ApiProperty({
    description: `It is used to specify a tenant context during trigger event.
    If a new tenant object is provided, we will create a new tenant.
    `,
    oneOf: [
      { type: 'string', description: 'Unique identifier of a tenant in your system' },
      { $ref: getSchemaPath(TenantPayloadDto) },
    ],
  })
  @IsOptional()
  @ValidateIf((_, value) => typeof value !== 'string')
  @ValidateNested()
  @Type(() => TenantPayloadDto)
  tenant?: TriggerTenantContext;
}
