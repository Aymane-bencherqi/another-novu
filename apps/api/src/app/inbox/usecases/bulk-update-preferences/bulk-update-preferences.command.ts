// apps/api/src/app/inbox/usecases/bulk-update-preferences/bulk-update-preferences.command.ts
import { IsArray, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';

import { EnvironmentWithSubscriber } from '../../../shared/commands/project.command';
import { BulkUpdatePreferenceItemDto } from '../../dtos/bulk-update-preferences-request.dto';

export class BulkUpdatePreferencesCommand extends EnvironmentWithSubscriber {
  @IsDefined()
  @IsArray()
  @Type(() => BulkUpdatePreferenceItemDto)
  readonly preferences: BulkUpdatePreferenceItemDto[];
}
