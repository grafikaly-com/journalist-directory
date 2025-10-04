import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreatePublicationTierDto } from './dto/create-publication-tier.dto';
import { UpdatePublicationTierDto } from './dto/update-publication-tier.dto';
import { PublicationTierService } from './publication-tier.service';

@Controller('publication-tier')
export class PublicationTierController {
  constructor(private readonly publicationTierService: PublicationTierService) {}

  @Post()
  create(@Body() createPublicationTierDto: CreatePublicationTierDto) {
    return this.publicationTierService.create(createPublicationTierDto);
  }

  @Get()
  findAll(@Query('name') name = '') {
    return this.publicationTierService.findAll(name);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.publicationTierService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePublicationTierDto: UpdatePublicationTierDto) {
    return this.publicationTierService.update(+id, updatePublicationTierDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.publicationTierService.remove(+id);
  }
}
