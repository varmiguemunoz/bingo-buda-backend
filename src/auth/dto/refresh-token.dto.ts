import { IsJWT, IsNotEmpty, IsObject } from 'class-validator';

class RefreshTokenPayloadDto {
  sub: number;
  email: string;
  role: {
    id: number;
    rol: string;
  };
  empresa: {
    id: number;
    nombre: string;
  };
  iat?: number;
  exp?: number;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsJWT()
  refreshToken: string;

  @IsObject()
  @IsNotEmpty()
  tokenPayload: RefreshTokenPayloadDto;
}

export class RefreshTokenResponseDto {
  accessToken: string;
}
