import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class MasukDto {
  @IsNotEmpty({ message: 'Email tidak boleh kosong!' })
  @IsEmail({}, { message: 'Format email tidak valid!' })
  email: string;

  @IsNotEmpty({ message: 'Password tidak boleh kosong!' })
  @IsString()
  password: string;
}
