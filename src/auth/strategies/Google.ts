import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { ENVS } from 'src/utils/constants';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: ENVS.GOOGLE_CLIENT_ID,
      clientSecret: ENVS.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3001/api/auth/google/redirect',
      scope: ['profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { emails, displayName } = profile;
    const user = await this.authService.validateUser({
      email: emails![0].value,
      displayName,
    });
    return user;
  }
}
