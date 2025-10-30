import { IsString, IsEmail, IsOptional, IsUrl } from 'class-validator';

export class LinkedinDataDto {
  @IsString()
  id: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsUrl()
  @IsOptional()
  avatar: string;

  @IsString()
  accessToken: string;

  @IsString()
  @IsOptional()
  refreshToken?: string;
}
