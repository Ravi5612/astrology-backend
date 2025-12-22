import { Request } from 'express';
import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Query,
  Get,
} from '@nestjs/common';

import { AuthService } from '../../infrastructure/persistence/services/auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from '../dto';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { TokenService } from '../../infrastructure/persistence/services/token.service';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  SendMagicLinkDto,
} from '../dto/register.dto';
import { JwtAuthGuard } from '../guards/auth.guard';
import { AuthFacade } from '../../application/auth.facade';
import { instanceToPlain } from 'class-transformer';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authFacade: AuthFacade) {}

  @Post('email/register')
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const { user, tokens } = await this.authFacade.register(
      dto,
      req.ip,
      req.get('user-agent'),
    );

    return instanceToPlain({ user, ...tokens });
  }

  @Post('email/login')
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const { user, tokens } = await this.authFacade.loginWithEmail(
      dto,
      req.ip,
      req.get('user-agent'),
    );

    return instanceToPlain({ user, ...tokens });
  }

  @Post('email/verify')
  confirmEmail(@Body('token') token: string) {
    return this.authFacade.verifyEmail(token);
  }

  @Post('email/confirm/new')
  resendConfirmation(@Body('email') email: string) {
    return this.authFacade.resendVerificationEmail(email);
  }

  // @Post('forgot/password')
  // forgotPassword(@Body() dto: ForgotPasswordDto) {
  //   return this.authService.forgotPassword(dto.email);
  // }

  // @Post('reset/password')
  // resetPassword(@Query('token') token: string, @Body() dto: ResetPasswordDto) {
  //   return this.authService.resetPassword(token, dto.password);
  // }

  // @Post('refresh')
  // refresh(@CurrentUser('id') id: number, @Body() dto: RefreshTokenDto) {
  //   return this.tokenService.refreshTokens(id, dto.refreshToken);
  // }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@CurrentUser('id') id: number) {
    return this.authFacade.logout(id);
  }

  // @Post('magic/new')
  // sendMagicLink(@Body() dto: SendMagicLinkDto, @Req() req: Request) {
  //   return this.authService.sendMagicLink(dto.email);
  // }

  // @Get('magic/login')
  // magicLinkLogin(@Query('token') token: string, @Req() req: Request) {
  //   return this.authService.magicLinkLogin(
  //     token,
  //     req.ip,
  //     req.get('user-agent'),
  //   );
  // }
}
