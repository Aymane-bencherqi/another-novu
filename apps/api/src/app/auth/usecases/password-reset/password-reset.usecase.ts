import { Injectable, BadRequestException } from '@nestjs/common';
import { hash } from 'bcrypt';
import { isBefore, subDays } from 'date-fns';
import { UserRepository } from '@novu/dal';
import { InvalidateCacheService, buildUserKey } from '@novu/application-generic';
import { AuthService } from '../../services/auth.service';
import { PasswordResetCommand } from './password-reset.command';

@Injectable()
export class PasswordReset {
  constructor(
    private invalidateCache: InvalidateCacheService,
    private userRepository: UserRepository,
    private authService: AuthService
  ) {}

  async execute(command: PasswordResetCommand): Promise<{ token: string }> {
    const user = await this.userRepository.findUserByToken(command.token);
    if (!user) {
      throw new BadRequestException('Bad token provided');
    }

    if (user.resetTokenDate && isBefore(new Date(user.resetTokenDate), subDays(new Date(), 7))) {
      throw new BadRequestException('Token has expired');
    }

    const passwordHash = await hash(command.password, 10);

    await this.invalidateCache.invalidateByKey({
      key: buildUserKey({
        _id: user._id,
      }),
    });

    await this.userRepository.update(
      {
        _id: user._id,
      },
      {
        $set: {
          password: passwordHash,
        },
        $unset: {
          resetToken: 1,
          resetTokenDate: 1,
          resetTokenCount: '',
        },
      }
    );

    return {
      token: await this.authService.generateUserToken(user),
    };
  }
}
