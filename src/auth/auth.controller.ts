import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { User } from 'src/generated/prisma/client';
import { AuthService } from './auth.service';
import {
  GoogleAuthGuard,
  JwtAuthGuard,
  JwtRefreshAuthGuard,
} from './utils/Guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  handleGoogleLogin() {
    return {};
  }

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async handleRedirect(@Req() req: Request) {
    const user = req.user! as User;
    const { accessToken, refreshToken } = await this.authService.signTokens(
      user.id,
    );
    // return res.redirect(
    //   `${ENVS.FRONTEND_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    // );
    return {
      accessToken,
      refreshToken,
    };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  async handleRefresh(@Req() req: Request) {
    const { accessToken, refreshToken } = await this.authService.signTokens(
      (req.user! as User).id,
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout() {}
}
