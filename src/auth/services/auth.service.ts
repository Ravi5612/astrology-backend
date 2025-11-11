import * as argon2 from 'argon2';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { TokenService } from './token.service';
import { RegisterDto, LoginDto } from '../dto';
import { OAuthUserDto } from '../dto/oauth-user.dto';
import { OAuthService } from './oauth.service';
import { DatabaseService } from 'src/core/database/database.service';
import { instanceToPlain } from 'class-transformer';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  UserRegisteredEvent,
  ConfirmEmailEvent,
  ResetPasswordEvent,
  SendMagicLinkEvent,
} from '@/notification/events/user.event';
import { JsonWebTokenError } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tokenService: TokenService,
    private oauthService: OAuthService,
    private db: DatabaseService,
    private eventEmitter: EventEmitter2,
  ) {}

  async register(dto: RegisterDto, ip?: string, userAgent?: string) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new BadRequestException('Email already exists!');
    }

    const hashed = await argon2.hash(dto.password, { type: argon2.argon2id });

    const { roles, ...registerDto } = dto;

    const formattedRoles = roles.map((r) => ({
      name: r,
    }));
    return await this.db.transaction(async (queryRunner) => {
      const user = await this.usersService.create(
        { ...registerDto, roles: formattedRoles, password: hashed },
        queryRunner,
      );
      const tokens = await this.tokenService.generateTokens(
        user,
        ip,
        userAgent,
        queryRunner,
      );

      const verification_token = this.tokenService.generate5MinToken({
        sub: user.id,
        email: user.email,
      });

      // send email notification
      this.eventEmitter.emit(
        'user:register',
        new UserRegisteredEvent(
          user.id,
          user.email,
          user.name,
          verification_token,
        ),
      );

      return instanceToPlain({ user, ...tokens });
    });
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user || !user.password)
      throw new UnauthorizedException('Invalid credentials');

    const valid = await argon2.verify(user.password, password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(dto: LoginDto, ip?: string, userAgent?: string) {
    const user = await this.validateUser(dto.email, dto.password);
    const tokens = await this.tokenService.generateTokens(user, ip, userAgent);
    return instanceToPlain({ user, ...tokens });
  }

  async oauthLogin(dto: OAuthUserDto, ip?: string, userAgent?: string) {
    // Find or create the user based on OAuth info
    const user = await this.oauthService.findOrCreateUserFromOAuth(dto);

    // Generate tokens for the user (access + refresh)
    const tokens = await this.tokenService.generateTokens(user, ip, userAgent);

    return { user, ...tokens };
  }

  async logout(id: number) {
    await this.tokenService.revoke(id);
  }

  async confirmEmail(token: string) {
    try {
      const payload = await this.tokenService.verifyToken(token);

      const userToConfirm = await this.usersService.findByEmail(payload.email);

      if (!userToConfirm) {
        throw new UnauthorizedException('User not found');
      }

      if (userToConfirm.emailVerified) {
        return {
          message: 'Email already verified',
        };
      }

      await this.usersService.update(userToConfirm.id, {
        emailVerified: true,
      });

      return {
        message: 'Email verified successfully',
      };
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new BadRequestException('Invalid or expired token');
      }

      throw error;
    }
  }

  async resendConfirmationEamil(email: string) {
    const existingUser = await this.usersService.findByEmail(email);

    if (!existingUser) {
      throw new BadRequestException("User not found or doesn't exist");
    }

    const verification_token = this.tokenService.generate5MinToken({
      sub: existingUser.id,
      email: existingUser.email,
    });

    this.eventEmitter.emit(
      'user:confirm',
      new ConfirmEmailEvent(existingUser.email, verification_token),
    );

    return {
      message: 'Confirmation email sent!',
    };
  }

  async forgotPassword(email: string) {
    const existingUser = await this.usersService.findByEmail(email);

    if (!existingUser) {
      throw new BadRequestException("User not found or doesn't exist");
    }

    const reset_password_token = this.tokenService.generate5MinToken({
      sub: existingUser.id,
      email: existingUser.email,
    });

    this.eventEmitter.emit(
      'user:reset-password',
      new ResetPasswordEvent(existingUser.email, reset_password_token),
    );

    return {
      message: 'Password reset link sent!',
    };
  }

  async resetPassword(token: string, password: string) {
    try {
      const payload = await this.tokenService.verifyToken(token);

      const existingUser = await this.usersService.findByEmail(payload.email);

      if (!existingUser) {
        throw new BadRequestException("User not found or doesn't exist");
      }

      const hashed = await argon2.hash(password, { type: argon2.argon2id });

      await this.usersService.update(existingUser.id, {
        password: hashed,
      });

      return {
        message: 'Password updated successfully!',
      };
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new BadRequestException('Invalid or expired token');
      }

      throw error;
    }
  }

  async sendMagicLink(email: string) {
    const existingUser = await this.usersService.findByEmail(email);

    if (!existingUser) {
      throw new BadRequestException("User not found or doesn't exist");
    }

    const token = this.tokenService.generate5MinToken({
      sub: existingUser.id,
      email: existingUser.email,
    });

    this.eventEmitter.emit(
      'user:magic-link',
      new SendMagicLinkEvent(existingUser.email, token),
    );

    return {
      message: 'Magic link sent successfully!',
    };
  }

  async magicLinkLogin(token: string, ip?: string, userAgent?: string) {
    try {
      const payload = await this.tokenService.verifyToken(token);

      const user = await this.usersService.findByEmail(payload.email);

      if (!user) {
        throw new UnauthorizedException("User not found or doesn't exist");
      }

      const tokens = await this.tokenService.generateTokens(
        user,
        ip,
        userAgent,
      );
      return instanceToPlain({ user, ...tokens });
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new BadRequestException('Invalid or expired token');
      }

      throw error;
    }
  }
}
