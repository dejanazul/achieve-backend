import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsStrongPassword,
} from 'class-validator';

export class DaftarDto {
  @IsNotEmpty({ message: 'Email tidak boleh kosong!' })
  @IsEmail({}, { message: 'Format email tidak valid!' })
  email: string;

  @IsNotEmpty({ message: 'Password tidak boleh kosong!' })
  @IsString()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password harus minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan karakter spesial',
    },
  )
  password: string;
}
