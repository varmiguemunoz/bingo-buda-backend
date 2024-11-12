import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { FacUsuarios } from 'src/entities/fac-usuarios.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FacUsuarios])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
