import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-linkedin-oauth2';
import { AuthService } from '../auth.service';
import { LinkedinDataDto } from '../dto/linkedinData.dto';

@Injectable()
export class LinkedinStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.LINKEDIN_CLIENT_ID ?? '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? '',
      callbackURL: process.env.LINKEDIN_CALLBACK_URL ?? '',
      scope: ['openid', 'profile', 'email'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): LinkedinDataDto {
    const { id, emails, name, photos } = profile;

    const linkedinData: LinkedinDataDto = {
      id: id,
      linkedinId: id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      profilePicture: photos[0]?.value || null,
      accessToken: accessToken,
    };
    return linkedinData;
  }
}
