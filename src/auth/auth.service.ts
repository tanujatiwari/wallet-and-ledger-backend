import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { ENVS } from 'src/utils/constants';
import { UserDetails } from './utils/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser({ displayName, email }: UserDetails) {
    const user = await this.prisma.user.upsert({
      create: { displayName, email },
      update: { displayName },
      where: { email },
    });
    return user;
  }

  async signTokens(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new UnauthorizedException();
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: user.id,
          email: user.email,
        },
        {
          secret: ENVS.JWT_SECRET_KEY,
          expiresIn: ENVS.JWR_EXPIRES_IN,
        },
      ),
      this.jwtService.signAsync(
        {
          id: user.id,
          email: user.email,
        },
        {
          secret: ENVS.JWT_REFRESH_SECRET_KEY,
          expiresIn: '7d',
        },
      ),
    ]);
    console.log('signed tokens', refreshToken, accessToken);
    return {
      accessToken,
      refreshToken,
    };
  }
}
