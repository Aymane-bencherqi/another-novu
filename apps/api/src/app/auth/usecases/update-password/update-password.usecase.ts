import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { buildUserKey, InvalidateCacheService } from '@novu/application-generic';
import { UserRepository } from '@novu/dal';
import { hash, compare } from 'bcrypt';

import { UpdatePasswordCommand } from './update-password.command';

@Injectable()
export class UpdatePassword {
  constructor(
    private invalidateCache: InvalidateCacheService,
    private userRepository: UserRepository
  ) {}

  async execute(command: UpdatePasswordCommand) {
    if (command.newPassword !== command.confirmPassword) {
      throw new BadRequestException('Passwords do not match.');
    }

    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    if (!user.password) {
      throw new BadRequestException('OAuth user cannot change password.');
    }

    const isAuthorized = await compare(command.currentPassword, user.password);

    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

    await this.setNewPassword(user._id, command.newPassword);

    await this.invalidateCache.invalidateByKey({
      key: buildUserKey({
        _id: user._id,
      }),
    });
  }

  private async setNewPassword(userId: string, newPassword: string) {
    const newPasswordHash = await hash(newPassword, 10);

    await this.userRepository.update(
      {
        _id: userId,
      },
      {
        $set: {
          password: newPasswordHash,
        },
      }
    );
  }
}
