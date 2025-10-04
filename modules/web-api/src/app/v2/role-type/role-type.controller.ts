import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_VALUE } from 'src/constants';
import { CreateRoleTypeDto } from './dto/create-role-type.dto';
import { UpdateRoleTypeDto } from './dto/update-role-type.dto';
import { RoleTypeService } from './role-type.service';

@Controller('role-type')
export class RoleTypeController {
  constructor(
    private readonly roleTypeService: RoleTypeService,
    private configService: ConfigService
  ) {}

  @Post()
  create(@Body() createRoleTypeDto: CreateRoleTypeDto) {
    return this.roleTypeService.create(createRoleTypeDto);
  }

  @Get()
  findAll(
    @Query('marker') marker = '0',
    @Query('limit') limit = this.configService.get<string>(DEFAULT_PAGE_SIZE) ?? DEFAULT_PAGE_SIZE_VALUE,
    @Query('sort') sort = 'name:asc',
    @Query('name') name = ''
  ) {
    return this.roleTypeService.findAll(marker, limit, sort, name);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleTypeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleTypeDto: UpdateRoleTypeDto) {
    return this.roleTypeService.update(+id, updateRoleTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleTypeService.remove(+id);
  }
}
