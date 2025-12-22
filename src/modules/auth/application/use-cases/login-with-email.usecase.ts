import { Injectable } from '@nestjs/common';
import { LoginDto } from '../../interface/dto';
import { UsersService } from '@/modules/users/users.service';
import { Argon2PasswordHasher } from '../../infrastructure/hashing/argon2-password.hasher';
import { User } from '@/modules/users/entities/user.entity';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error';
import { AuthPolicy } from '../../domain/policies/auth.policy';
import { IssueAuthTokensUseCase } from './issue-auth-tokens.usecase';

@Injectable()
export class LoginWithEmailUseCase {
  constructor(
    private readonly usersService: UsersService,
    private passwordHasher: Argon2PasswordHasher,
    private readonly issueTokens: IssueAuthTokensUseCase,
  ) {}

  async execute(dto: LoginDto, ip?: string, userAgent?: string) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);

    const isValidPassword = await this.validatePassword(dto, user);

    if (!user || !user.password || !isValidPassword) {
      throw new InvalidCredentialsError();
    }

    AuthPolicy.ensureCanLogin(user);

    const tokens = await this.issueTokens.execute(user, ip, userAgent);

    return { user, tokens };
  }

  private async validatePassword(dto: LoginDto, user?: User | null) {
    const fallbackInvalidPassword = await this.passwordHasher.hash(
      'fallbackInvalidPassword',
    );

    const isValid = await this.passwordHasher.verify(
      user?.password ?? fallbackInvalidPassword,
      dto.password,
    );

    return isValid;
  }
}
