import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller({
  path: 'auth/google',
  version: '1',
})
export class GoogleAuthController {
  @Get('login')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    return;
  }

  @Get('callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request) {
    return req.user;
  }
}
