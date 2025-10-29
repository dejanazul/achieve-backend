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

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // method daftar
  async daftar(daftarDto: DaftarDto) {
    // check existing user
    const existingUser = await this.prisma.user.findUnique({
      where: { email: daftarDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email Sudah Terdaftar!');
    }

    // hash password
    const hashedPassword = await bcrypt.hash(daftarDto.password, 10);

    // create user
    const user = await this.prisma.user.create({
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
    const user = await this.prisma.user.findUnique({
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

  async loginWithLinkedin(user: LinkedinDataDto) {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
      },
    };
  }
}
