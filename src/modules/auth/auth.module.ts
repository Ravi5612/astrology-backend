import { Module } from '@nestjs/common';
// import { AuthService } from './services/auth.service';
// import { AuthController } from './presentation/controllers/auth.controller';
import { AuthController } from './interface/controllers/auth.controller';
// import { TokenService } from './services/token.service';
// import { OAuthService } from './services/oauth.service';
import { UsersModule } from '@/modules/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credential } from './infrastructure/persistence/entities/credential.entity';
import { OAuthAccount } from './infrastructure/persistence/entities/oauth-accounts.entity';
import { JwtStrategy } from './interface/strategies/jwt.strategy';
// import { GoogleStrategy } from './presentation/strategies/google.strategy';

import { DatabaseModule } from 'src/core/database/database.module';
// import { GoogleAuthController } from './presentation/controllers/google-auth.controller';
import { UsedTokens } from './infrastructure/persistence/entities/used-tokens.entity';
import { AuthFacade } from './application/auth.facade';
import { LoginWithEmailUseCase } from './application/use-cases/login-with-email.usecase';
import { RegisterUserUseCase } from './application/use-cases/register-user.usecase';
import { Argon2PasswordHasher } from './infrastructure/hashing/argon2-password.hasher';
import { IssueAuthTokensUseCase } from './application/use-cases/issue-auth-tokens.usecase';
import { TokenCryptoService } from './infrastructure/tokens/token-crypto.service';
import { CredentialRepository } from './infrastructure/persistence/repositories/credentials.repository';
import { UserRegisteredHandler } from './application/event-handlers/user-registered.handler';
import { EmailService } from '@/common/services/email.service';
import { LoginWithGoogleUseCase } from './application/use-cases/login-with-google.usecase';
import { OAuthService } from './infrastructure/persistence/services/oauth.service';
import { GoogleStrategy } from './interface/strategies/google.strategy';
import { GoogleAuthController } from './interface/controllers/google-auth.controller';
import { LogoutUserUseCase } from './application/use-cases/logout-user.usecase';
import { VerifyEmailUseCase } from './application/use-cases/verify-email.usecase';
import { UsedTokensService } from './infrastructure/persistence/services/used-tokens.service';
import { ResendVerificationEmailUseCase } from './application/use-cases/resend-verification-email.usecase';
// import { EmailService } from '@/common/services/email.service';
// import { UsedTokensService } from './services/used-tokens.service';
@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Credential, OAuthAccount, UsedTokens]),
    DatabaseModule,
  ],
  providers: [
    // AuthService,
    // TokenService,
    OAuthService,
    UsedTokensService,
    JwtStrategy,
    AuthFacade,
    GoogleStrategy,
    RegisterUserUseCase,
    LoginWithEmailUseCase,
    LoginWithGoogleUseCase,
    IssueAuthTokensUseCase,
    LogoutUserUseCase,
    VerifyEmailUseCase,
    ResendVerificationEmailUseCase,
    Argon2PasswordHasher,
    TokenCryptoService,
    CredentialRepository,
    UserRegisteredHandler,
    EmailService,
  ],
  controllers: [AuthController, GoogleAuthController],
  // exports: [TokenService, OAuthService],
})
export class AuthModule {}
