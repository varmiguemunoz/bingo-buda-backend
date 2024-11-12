import {
  IsEmail,
  IsJWT,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class ResetPassswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\w\d\s])(?!.*(\$)\1\1)[\w\d\S]{8,}$/,
    {
      message:
        'La contraseña debe contener al menos 8 caracteres e incluir una letra mayúscula, una letra minúscula, un número y un carácter especial.',
    },
  )
  password: string;

  @IsNotEmpty()
  @IsJWT()
  resetToken: string;
}
