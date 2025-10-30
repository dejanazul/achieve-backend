import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import express from 'express';
import { DaftarDto } from './dto/daftar.dto';
import { MasukDto } from './dto/masuk.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import type { LinkedInProfile } from './types/linkedin.types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('daftar')
  async daftar(@Body() daftarDto: DaftarDto) {
    return this.authService.daftar(daftarDto);
  }

  @Post('masuk')
  async masuk(@Body() masukDto: MasukDto) {
    return this.authService.masuk(masukDto);
  }

  @Get('linkedin')
  @UseGuards(AuthGuard('linkedin'))
  async linkedinAuth(): Promise<void> {}

  @Get('linkedin/callback')
  @UseGuards(AuthGuard('linkedin'))
  linkedinCallback(
    @Request() req: LinkedInProfile,
    @Res() res: express.Response,
  ) {
    // const jwtPayload = this.authService.generateJwtToken(req.user);
    // return {
    //   statusCode: 200,
    //   message: 'LinkedIn authentication successful',
    //   data: jwtPayload,
    // };
    res.redirect(`${process.env.FRONTEND_URL_REGISTERED}`);
  }
}
