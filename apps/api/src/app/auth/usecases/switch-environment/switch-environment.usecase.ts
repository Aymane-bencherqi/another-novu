import { forwardRef, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { EnvironmentRepository, MemberRepository, UserRepository } from '@novu/dal';
import { AuthService } from '../../services/auth.service';
import { SwitchEnvironmentCommand } from './switch-environment.command';

@Injectable()
export class SwitchEnvironment {
  constructor(
    private environmentRepository: EnvironmentRepository,
    private userRepository: UserRepository,
    private memberRepository: MemberRepository,
    private authService: AuthService
  ) {}

  async execute(command: SwitchEnvironmentCommand) {
    const environment = await this.environmentRepository.findOne({
      _id: command.newEnvironmentId,
    });
    if (!environment) throw new NotFoundException('Environment not found');
    if (environment._organizationId !== command.organizationId) {
      throw new UnauthorizedException('Not authorized for organization');
    }

    const member = await this.memberRepository.findMemberByUserId(command.organizationId, command.userId);
    if (!member) throw new NotFoundException('Member is not found');

    const user = await this.userRepository.findById(command.userId);
    if (!user) throw new NotFoundException('User is not found');

    const token = await this.authService.getSignedToken(user, command.organizationId, member, command.newEnvironmentId);

    return token;
  }
}
