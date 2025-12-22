import { Injectable } from '@nestjs/common';
import { LoginWithEmailUseCase } from './use-cases/login-with-email.usecase';
import { RegisterUserUseCase } from './use-cases/register-user.usecase';
import { LoginDto, RegisterDto } from '../interface/dto';
import { LogoutUserUseCase } from './use-cases/logout-user.usecase';
import { VerifyEmailUseCase } from './use-cases/verify-email.usecase';
import { ResendVerificationEmailUseCase } from './use-cases/resend-verification-email.usecase';

@Injectable()
export class AuthFacade {
  constructor(
    private readonly loginWithEmailUseCase: LoginWithEmailUseCase,
    private readonly registerUser: RegisterUserUseCase,
    private readonly logoutUser: LogoutUserUseCase,
    private readonly verifyEmailForUser: VerifyEmailUseCase,
    private readonly resendVerificationEmailForUser: ResendVerificationEmailUseCase,
  ) {}

  async loginWithEmail(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    return this.loginWithEmailUseCase.execute(dto, ipAddress, userAgent);
  }

  async register(dto: RegisterDto, ipAddress?: string, userAgent?: string) {
    return this.registerUser.execute(dto, ipAddress, userAgent);
  }

  async logout(userId: number) {
    return this.logoutUser.execute(userId);
  }

  async verifyEmail(token: string) {
    return this.verifyEmailForUser.execute(token);
  }

  async resendVerificationEmail(email: string) {
    return this.resendVerificationEmailForUser.execute(email);
  }
}
