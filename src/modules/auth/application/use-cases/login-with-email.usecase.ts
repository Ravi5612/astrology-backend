import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { LoginDto } from '../../api/dto';
import { UsersFacade } from '@/modules/users/application/users.facade';
import { Argon2PasswordHasher } from '../../infrastructure/hashing/argon2-password.hasher';
import { User } from '@/modules/users/infrastructure/persistence/entities/user.entity';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error';
import { AuthPolicy } from '../../domain/policies/auth.policy';
import { IssueAuthTokensUseCase } from './issue-auth-tokens.usecase';

@Injectable()
export class LoginWithEmailUseCase {
  constructor(
    private readonly usersFacade: UsersFacade,
    private passwordHasher: Argon2PasswordHasher,
    private readonly issueTokens: IssueAuthTokensUseCase,
  ) {}

  async execute(dto: LoginDto, ip?: string, userAgent?: string) {
    const user = await this.usersFacade.findByEmailWithPassword(dto.email);

    if (!user) {
      throw new UnauthorizedException('User not found with this email. Please sign up first.');
    }

    const isValidPassword = await this.validatePassword(dto, user);

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid password. Please try again.');
    }

    // Role Check: If user only has expert role and is trying to login to the main app
    const hasClientRole = user.roles?.some(role => 
      ['client', 'user', 'customer'].includes(role.name.toLowerCase())
    );
    const hasExpertRole = user.roles?.some(role => 
      ['expert', 'astrologer'].includes(role.name.toLowerCase())
    );

    if (hasExpertRole && !hasClientRole) {
      throw new ForbiddenException('Aap ek Expert hain. Kripya Expert Dashboard se login karein.');
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
