import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtResetPasswordSecret: process.env.JWT_RESET_PASSWORD_SECRET,
  jwtExpirationTime: process.env.JWT_EXPIRATION_TIME,
  jwtRefreshExpirationTime: process.env.JWT_REFRESH_EXPIRATION_TIME,
  jwtResetPasswordExpirationTime:
    process.env.JWT_RESET_PASSWORD_EXPIRATION_TIME,
  jwtSetPasswordExpirationTime: process.env.JWT_SET_PASSWORD_EXPIRATION_TIME,
  bcryptSaltOrRound: parseInt(process.env.BCRYPT_SALT_OR_ROUND, 10),
  frontendUrl: process.env.FRONTEND_URL,
}));
