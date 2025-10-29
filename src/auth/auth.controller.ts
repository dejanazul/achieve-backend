import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import express from 'express';
import { DaftarDto } from './dto/daftar.dto';
import { MasukDto } from './dto/masuk.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LinkedinDataDto } from './dto/linkedinData.dto';

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

  @Get('linkedin/redirect')
  @UseGuards(AuthGuard('linkedin'))
  async linkedinAuthCallback(
    @Req() req: express.Request & { user: LinkedinDataDto },
    @Res() res: express.Response,
  ): Promise<void> {
    const user = await this.authService.loginWithLinkedin(req.user);
    // add frontend home endpoint
    return res.redirect(
      'https://www.linkedin.com/developers/tools/oauth/redirect',
    );
  }
}
