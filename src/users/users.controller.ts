import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpException,
  Param,
  ParseIntPipe,
  Patch,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { FacUsuarios } from 'src/entities/fac-usuarios.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.getUsers();
  }

  @Get(':id')
  findOneUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FacUsuarios> | HttpException {
    return this.usersService.findOneUser(id);
  }

  @Patch(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() user: UpdateUserDto,
  ): Promise<FacUsuarios | HttpException> {
    return this.usersService.update(id, user);
  }
}
