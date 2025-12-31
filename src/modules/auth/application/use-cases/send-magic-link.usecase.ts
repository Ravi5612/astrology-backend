import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersService } from '@/modules/users/users.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { TokenCryptoService } from '../../infrastructure/tokens/token-crypto.service';
import { SendMagicLinkEvent } from '../../domain/events/send-magic-link.event';

@Injectable()
export class SendMagicLinkUseCase {
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

    const token = this.tokenCrypto.signTemporaryToken({
      sub: existingUser.id,
      email: existingUser.email,
    });

    this.eventEmitter.emit(
      'auth.magic.link',
      new SendMagicLinkEvent(existingUser.email, token),
    );

    return {
      message: 'Magic link sent successfully!',
    };
  }
}
