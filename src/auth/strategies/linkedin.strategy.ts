import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOption } from 'passport-linkedin-oauth2';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LinkedinStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('LINKEDIN_CLIENT_ID') ?? '',
      clientSecret: configService.get<string>('LINKEDIN_CLIENT_SECRET') ?? '',
      callbackURL: configService.get<string>('LINKEDIN_CALLBACK_URL') ?? '',
      scope: ['openid', 'profile', 'email'],
      state: true,
      skipUserProfile: true,
    } as StrategyOption);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile,
    done: (error: any, user?: any, info?: any) => void,
  ): Promise<void> {
    try {
      const userProfile = await this.fetchLinkedinUserProfile(accessToken);

      const linkedinProfile = {
        id: userProfile.sub,
        firstName: userProfile.given_name,
        lastName: userProfile.family_name,
        email: userProfile.email,
        avatar: userProfile.picture,
        accessToken,
        refreshToken,
      };

      const user = await this.authService.findOrCreateUser(linkedinProfile);
      done(null, user);
    } catch (error) {
      console.error('LinkedIn validation error:', error);
      done(error);
    }
  }

  private async fetchLinkedinUserProfile(accessToken: string) {
    const endpoints = [
      {
        url: 'https://api.linkedin.com/v2/userinfo',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      },
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url, {
          method: 'GET',
          headers: endpoint.headers,
        });

        if (response.ok) {
          return await response.json();
        }

        console.warn(
          `Failed to fetch from ${endpoint.url}: ${response.statusText}`,
        );
      } catch (error) {
        console.error(`Error fetching from ${endpoint.url}:`, error);
        continue;
      }
    }

    throw new Error(
      'Failed to fetch user profile from LinkedIn after trying all endpoints',
    );
  }
}
