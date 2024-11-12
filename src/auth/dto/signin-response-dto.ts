import { FacUsuarios } from 'src/entities/fac-usuarios.entity';

export class SignInResponseDto {
  accessToken: string;
  refreshToken: string;
  user: FacUsuarios;
}
