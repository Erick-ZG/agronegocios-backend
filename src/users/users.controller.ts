import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('users.read')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @RequirePermissions('users.read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @RequirePermissions('users.write')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('users.write')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.usersService.update(id, dto, user.id);
  }

  @Patch(':id/password')
  @RequirePermissions('users.write')
  updatePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('users.write')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.usersService.remove(id, user.id);
  }
}
