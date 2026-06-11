import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(req: Request) {
    const refreshToken =
      (req.cookies as Record<string, string> | undefined)?.refreshToken ||
      req.headers?.authorization?.replace('Bearer ', '');

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    // Attach for downstream use
    (req as unknown as Record<string, unknown>)['refreshToken'] = refreshToken;

    return true;
  }
}
