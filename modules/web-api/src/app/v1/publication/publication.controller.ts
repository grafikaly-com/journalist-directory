import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_VALUE } from 'src/constants';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { PublicationService } from './publication.service';

@Controller('publication')
export class PublicationController {
  constructor(
    private readonly publicationService: PublicationService,
    private configService: ConfigService
  ) {}

  @Post()
  create(@Body() createPublicationDto: CreatePublicationDto) {
    return this.publicationService.create(createPublicationDto);
  }

  @Get()
  findAll(
    @Query('marker') marker = '0',
    @Query('limit') limit = this.configService.get<string>(DEFAULT_PAGE_SIZE) ?? DEFAULT_PAGE_SIZE_VALUE,
    @Query('sort') sort = 'name:asc',
    @Query('ids') ids: Array<number>,
    @Query('name') name = '',
    @Query('country') country = '',
    @Query('hasJournalist') hasJournalist = false
  ) {
    return this.publicationService.findAll(marker, limit, sort, ids, name, country, hasJournalist);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.publicationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePublicationDto: UpdatePublicationDto) {
    return this.publicationService.update(+id, updatePublicationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.publicationService.remove(+id);
  }
}
