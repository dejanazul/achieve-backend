import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';
import { DaftarDto } from './dto/daftar.dto';
import { MasukDto } from './dto/masuk.dto';
import { LinkedinDataDto } from './dto/linkedinData.dto';
import { LinkedInProfile } from './types/linkedin.types';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  // generate jwt token
  generateJwtToken(user: LinkedInProfile) {
    const payload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      },
    };
  }

  // method daftar
  async daftar(daftarDto: DaftarDto) {
    // check existing user
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: daftarDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email Sudah Terdaftar!');
    }

    // hash password
    const hashedPassword = await bcrypt.hash(daftarDto.password, 10);

    // create user
    const user = await this.prismaService.user.create({
      data: {
        email: daftarDto.email,
        password: hashedPassword,
      },
    });

    // jwt token
    const payload = {
      sub: user.id,
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  // method masuk
  async masuk(masukDto: MasukDto) {
    // find user by email
    const user = await this.prismaService.user.findUnique({
      where: { email: masukDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email atau Password Salah!');
    }

    // verify password
    const isPasswordValid = await bcrypt.compare(
      masukDto.password,
      user.password ? user.password : '',
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau Password Salah!');
    }

    // jwt token
    const payload = {
      sub: user.id,
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async findOrCreateUser(linkedinData: LinkedinDataDto) {
    const {
      id: linkedinId,
      email,
      firstName,
      lastName,
      avatar,
      accessToken,
      refreshToken,
    } = linkedinData;

    // check is user already exist
    let user = await this.prismaService.user.findUnique({
      where: { email },
      include: { linkedinProfiles: true },
    });

    // if no user create
    if (!user) {
      user = await this.prismaService.user.create({
        data: {
          email: email,
          firstName: firstName,
          lastName: lastName,
          avatar: avatar,
          linkedinAccessToken: accessToken,
          linkedinRefreshToken: refreshToken,
        },
        include: { linkedinProfiles: true },
      });
    } else {
      // if user exist update linkedin data
      user = await this.prismaService.user.update({
        where: { id: user.id },
        data: {
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
          avatar: avatar,
          linkedinId: linkedinId || user.linkedinId,
          linkedinAccessToken: accessToken,
          linkedinRefreshToken: refreshToken,
        },
        include: { linkedinProfiles: true },
      });
    }

    // save or update linked in profile record
    if (!user || !Array.isArray(user.linkedinProfiles)) {
      throw new Error('User or LinkedIn profiles not found!');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const existingProfile = user.linkedinProfiles.find(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (profile) => profile.linkedinId === linkedinId,
    );

    if (existingProfile) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await this.prismaService.linkedinProfile.update({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        where: { id: existingProfile.id },
        data: {
          accessToken,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          refreshToken: refreshToken || existingProfile.refreshToken,
          accessTokenExpiresAt: new Date(Date.now() + 3600 * 1000),
        },
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await this.prismaService.linkedinProfile.create({
        data: {
          linkedinId,
          firstName,
          lastName,
          email,
          avatar,
          accessToken,
          refreshToken,
          userId: user.id,
          accessTokenExpiresAt: new Date(Date.now() + 3600 * 1000),
        },
      });
    }

    return user;
  }

  // validate linkedin token
  async validateLinkedinToken(accessToken: string) {
    try {
      const response = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Invalid token');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to validate LinkedIn token: ${error}`);
    }
  }
}
