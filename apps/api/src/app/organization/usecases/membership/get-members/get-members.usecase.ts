import { Injectable, Scope } from '@nestjs/common';
import { MemberRepository } from '@novu/dal';
import { MemberRoleEnum, MemberStatusEnum } from '@novu/shared';
import { GetMembersCommand } from './get-members.command';

@Injectable({
  scope: Scope.REQUEST,
})
export class GetMembers {
  constructor(private membersRepository: MemberRepository) {}

  async execute(command: GetMembersCommand) {
    return (await this.membersRepository.getOrganizationMembers(command.organizationId))
      .map((member) => {
        if (!command.user.roles.includes(MemberRoleEnum.OSS_ADMIN)) {
          if (member.memberStatus === MemberStatusEnum.INVITED) return null;
          // eslint-disable-next-line no-param-reassign
          if (member.user) member.user.email = '';
          // eslint-disable-next-line no-param-reassign
          if (member.invite) member.invite.email = '';
        }

        return member;
      })
      .filter((member) => !!member);
  }
}
