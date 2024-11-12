import {
  Controller,
  Body,
  Post,
  HttpCode,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin-dto';
import { SignInResponseDto } from './dto/signin-response-dto';
import { Public } from './decorators/public.decorator';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import {
  RefreshTokenDto,
  RefreshTokenResponseDto,
} from './dto/refresh-token.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(200)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'email@gmail.com',
        },
        password: {
          type: 'string',
          example: 'password',
        },
      },
    },
  })
  @Post('/login')
  signIn(@Body() signInDto: SignInDto): Promise<SignInResponseDto> {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Public()
  @Post('/register')
  signUp(@Body() signUpDto: CreateUserDto) {
    return this.authService.signUp(signUpDto);
  }

  @ApiBearerAuth()
  @Post('/refresh-token')
  async refreshToken(
    @Body() refreshDto: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    return await this.authService.refreshAccessToken(refreshDto);
  }
}
