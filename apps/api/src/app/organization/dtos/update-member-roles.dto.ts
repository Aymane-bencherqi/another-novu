import { IsEnum } from 'class-validator';
import { MemberRoleEnum } from '@novu/shared';

export class UpdateMemberRolesDto {
  @IsEnum(MemberRoleEnum)
  role: MemberRoleEnum.OSS_ADMIN;
}
