import { Injectable } from '@nestjs/common';
import { LoginWithEmailUseCase } from './use-cases/login-with-email.usecase';
import { RegisterUserUseCase } from './use-cases/register-user.usecase';
import { AgentRegisterUserUseCase } from './use-cases/agent-register-user.usecase';
import { LoginDto, RegisterDto, AgentRegisterUserDto } from '../api/dto';
import { LogoutUserUseCase } from './use-cases/logout-user.usecase';
import { VerifyEmailUseCase } from './use-cases/verify-email.usecase';
import { ResendVerificationEmailUseCase } from './use-cases/resend-verification-email.usecase';
import { ForgotPasswordUseCase } from './use-cases/forgot-password.usecase';
import { ResetPasswordUseCase } from './use-cases/reset-password.usecase';
import { RefreshTokenUseCase } from './use-cases/refresh-token.usecase';
import { SendMagicLinkUseCase } from './use-cases/send-magic-link.usecase';
import { LoginWithMagicLinkUseCase } from './use-cases/login-with-magic-link.usecase';

@Injectable()
export class AuthFacade {
  constructor(
    private readonly loginWithEmailUseCase: LoginWithEmailUseCase,
    private readonly registerUser: RegisterUserUseCase,
    private readonly agentRegisterUserUseCase: AgentRegisterUserUseCase,
    private readonly logoutUser: LogoutUserUseCase,
    private readonly verifyEmailForUser: VerifyEmailUseCase,
    private readonly resendVerificationEmailForUser: ResendVerificationEmailUseCase,
    private readonly forgotPasswordUserCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly sendMagicLinkUseCase: SendMagicLinkUseCase,
    private readonly loginWithMagicLinkUseCase: LoginWithMagicLinkUseCase,
  ) { }

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

  async forgotPassword(email: string) {
    return this.forgotPasswordUserCase.execute(email);
  }

  async resetPassword(token: string, password: string) {
    return this.resetPasswordUseCase.execute(token, password);
  }

  async refreshToken(refreshToken: string) {
    return this.refreshTokenUseCase.execute(refreshToken);
  }

  async sendMagicLink(email: string) {
    return this.sendMagicLinkUseCase.execute(email);
  }

  async loginWithMagicLink(token: string, ip?: string, ua?: string) {
    return this.loginWithMagicLinkUseCase.execute(token, ip, ua);
  }

  async agentRegister(dto: AgentRegisterUserDto) {
    return this.agentRegisterUserUseCase.execute(dto);
  }
}

