import { Module } from '@nestjs/common';
// import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategies/Google';
import { PrismaService } from 'src/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { JwtModule } from '@nestjs/jwt';
import {
  JwtAccessStrategy,
  JwtRefreshStrategy,
} from './strategies/JWTStrategy';

@Module({
  imports: [PassportModule, JwtModule],
  providers: [
    AuthService,
    GoogleStrategy,
    PrismaService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
