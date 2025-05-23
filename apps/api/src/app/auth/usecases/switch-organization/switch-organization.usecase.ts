import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { MemberRepository, UserRepository } from '@novu/dal';
import { AuthService } from '../../services/auth.service';
import { SwitchOrganizationCommand } from './switch-organization.command';

@Injectable()
export class SwitchOrganization {
  constructor(
    private userRepository: UserRepository,
    private memberRepository: MemberRepository,
    private authService: AuthService
  ) {}

  async execute(command: SwitchOrganizationCommand) {
    const isAuthenticated = await this.authService.isAuthenticatedForOrganization(
      command.userId,
      command.newOrganizationId
    );
    if (!isAuthenticated) {
      throw new UnauthorizedException(`Not authorized for organization ${command.newOrganizationId}`);
    }

    const member = await this.memberRepository.findMemberByUserId(command.newOrganizationId, command.userId);
    if (!member) throw new BadRequestException('Member not found');

    const user = await this.userRepository.findById(command.userId);
    if (!user) throw new BadRequestException(`User ${command.userId} not found`);

    const token = await this.authService.getSignedToken(user, command.newOrganizationId, member);

    return token;
  }
}
