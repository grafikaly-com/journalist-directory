import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreatePublicationMediaTypeDto } from './dto/create-publication-media-type.dto';
import { UpdatePublicationMediaTypeDto } from './dto/update-publication-media-type.dto';
import { PublicationMediaTypeService } from './publication-media-type.service';

@Controller('publication-media-type')
export class PublicationMediaTypeController {
  constructor(private readonly publicationMediaTypeService: PublicationMediaTypeService) {}

  @Post()
  create(@Body() createPublicationMediaTypeDto: CreatePublicationMediaTypeDto) {
    return this.publicationMediaTypeService.create(createPublicationMediaTypeDto);
  }

  @Get()
  findAll(@Query('name') name = '', @Query('publicationIds') publicationIds: Array<number>) {
    return this.publicationMediaTypeService.findAll(name, publicationIds);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.publicationMediaTypeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePublicationMediaTypeDto: UpdatePublicationMediaTypeDto) {
    return this.publicationMediaTypeService.update(+id, updatePublicationMediaTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.publicationMediaTypeService.remove(+id);
  }
}
