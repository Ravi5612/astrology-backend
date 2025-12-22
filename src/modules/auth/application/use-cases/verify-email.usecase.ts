import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '@/core/database/database.service';
import { UsersService } from '@/modules/users/users.service';
import { UsedTokensService } from '../../infrastructure/persistence/services/used-tokens.service';
import { EmailVerificationPolicy } from '../../domain/policies/email-verification.policy';
import { TokenCryptoService } from '../../infrastructure/tokens/token-crypto.service';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    private readonly db: DatabaseService,
    private readonly usersService: UsersService,
    private readonly usedTokenService: UsedTokensService,
    private readonly tokenCrypto: TokenCryptoService,
  ) {}

  async execute(token: string) {
    const payload = await this.verifyTokenOrFail(token);

    const user = await this.usersService.findByEmail(payload.email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    EmailVerificationPolicy.ensureEmailNotVerified(user);

    const isTokenUsed = await this.usedTokenService.isTokenUsed(token, user.id);

    EmailVerificationPolicy.ensureTokenNotUsed(isTokenUsed);

    await this.db.transaction(async (qr) => {
      return Promise.all([
        this.usersService.update(
          user.id,
          { email_verified_at: new Date() },
          qr,
        ),
        this.usedTokenService.markTokenAsUsed(
          token,
          user.id,
          'email_confirmation',
          qr,
        ),
      ]);
    });

    return {
      message: 'Email verified successfully',
    };
  }

  // 🔐 infra → application boundary
  private verifyTokenOrFail(token: string) {
    try {
      return this.tokenCrypto.verifyJwt<{ sub: number; email: string }>(token);
    } catch {
      throw new BadRequestException('Invalid or expired token');
    }
  }
}
