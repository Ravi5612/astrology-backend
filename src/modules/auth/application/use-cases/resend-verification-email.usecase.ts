import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersService } from '@/modules/users/users.service';
import { TokenCryptoService } from '../../infrastructure/tokens/token-crypto.service';
import { VerifyEmailEvent } from '../../domain/events/verify-email.event';
import { EmailVerificationPolicy } from '../../domain/policies/email-verification.policy';

@Injectable()
export class ResendVerificationEmailUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenCrypto: TokenCryptoService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(email: string) {
    const existingUser = await this.usersService.findByEmail(email);

    if (!existingUser) {
      throw new BadRequestException("User not found or doesn't exist");
    }

    EmailVerificationPolicy.canResendVerification(existingUser);

    const verification_token = this.tokenCrypto.signTemporaryToken({
      sub: existingUser.id,
      email: existingUser.email,
    });

    this.eventEmitter.emit(
      'auth.email.verify',
      new VerifyEmailEvent(existingUser.email, verification_token),
    );

    return {
      message: 'Confirmation email sent!',
    };
  }
}
