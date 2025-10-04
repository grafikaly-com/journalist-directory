import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { RegionService } from './region.service';

@Controller('region')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Post()
  create(@Body() createRegionDto: CreateRegionDto) {
    return this.regionService.create(createRegionDto);
  }

  @Get()
  findAll(
    @Query('name') name = '',
    @Query('country') country = '',
    @Query('code') code = 'NZ',
    @Query('hasJournalist') hasJournalist = false
  ) {
    return this.regionService.findAll(name, country, code, hasJournalist);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.regionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRegionDto: UpdateRegionDto) {
    return this.regionService.update(+id, updateRegionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.regionService.remove(+id);
  }
}
