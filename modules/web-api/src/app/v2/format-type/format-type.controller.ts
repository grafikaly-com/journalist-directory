import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateFormatTypeDto } from './dto/create-format-type.dto';
import { UpdateFormatTypeDto } from './dto/update-format-type.dto';
import { FormatTypeService } from './format-type.service';

@ApiBearerAuth()
@Controller('format-type')
export class FormatTypeController {
  constructor(private readonly formatTypeService: FormatTypeService) {}

  @Post()
  create(@Body() createFormatTypeDto: CreateFormatTypeDto) {
    return this.formatTypeService.create(createFormatTypeDto);
  }

  @Get()
  findAll(@Query('marker') marker = '0', @Query('limit') limit = '20', @Query('sort') sort = '', @Query('name') name = '') {
    return this.formatTypeService.findAll(marker, limit, sort, name);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formatTypeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFormatTypeDto: UpdateFormatTypeDto) {
    return this.formatTypeService.update(id, updateFormatTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.formatTypeService.remove(id);
  }
}
