import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { UpsertRoleDto } from './dto/upsert-role.dto';
import { RolesService } from './roles.service';

@Controller()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('permissions')
  @RequirePermissions('roles.read')
  findPermissions() {
    return this.rolesService.findPermissions();
  }

  @Get('roles')
  @RequirePermissions('roles.read')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('roles/:id')
  @RequirePermissions('roles.read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.findOne(id);
  }

  @Post('roles')
  @RequirePermissions('roles.write')
  create(@Body() dto: UpsertRoleDto) {
    return this.rolesService.create(dto);
  }

  @Patch('roles/:id')
  @RequirePermissions('roles.write')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpsertRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete('roles/:id')
  @RequirePermissions('roles.write')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.remove(id);
  }
}
