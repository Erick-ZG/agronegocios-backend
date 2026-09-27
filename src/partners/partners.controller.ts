import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { QueryPartnersDto } from './dto/query-partners.dto';
import { SetActiveDto } from './dto/set-active.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { PartnersService } from './partners.service';

@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get()
  @RequirePermissions('partners.read')
  findAll(@Query() query: QueryPartnersDto) {
    return this.partnersService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('partners.read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.partnersService.findOne(id);
  }

  @Post()
  @RequirePermissions('partners.write')
  create(@Body() dto: CreatePartnerDto) {
    return this.partnersService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('partners.write')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePartnerDto) {
    return this.partnersService.update(id, dto);
  }

  @Patch(':id/active')
  @RequirePermissions('partners.write')
  setActive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: SetActiveDto,
  ) {
    return this.partnersService.setActive(id, body.isActive);
  }

  @Delete(':id')
  @RequirePermissions('partners.write')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.partnersService.remove(id);
  }
}
