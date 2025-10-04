import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_VALUE } from 'src/constants';
import { CreateNewsTypeDto } from './dto/create-news-type.dto';
import { UpdateNewsTypeDto } from './dto/update-news-type.dto';
import { NewsTypeService } from './news-type.service';

@Controller('news-type')
export class NewsTypeController {
  constructor(
    private readonly newsTypeService: NewsTypeService,
    private configService: ConfigService
  ) {}

  @Post()
  create(@Body() createNewsTypeDto: CreateNewsTypeDto) {
    return this.newsTypeService.create(createNewsTypeDto);
  }

  @Get()
  findAll(
    @Query('marker') marker = '0',
    @Query('limit') limit = this.configService.get<string>(DEFAULT_PAGE_SIZE) ?? DEFAULT_PAGE_SIZE_VALUE,
    @Query('sort') sort = '',
    @Query('name') name = ''
  ) {
    return this.newsTypeService.findAll(marker, limit, sort, name);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsTypeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNewsTypeDto: UpdateNewsTypeDto) {
    return this.newsTypeService.update(id, updateNewsTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.newsTypeService.remove(id);
  }
}
