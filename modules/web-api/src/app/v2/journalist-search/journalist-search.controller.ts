import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_VALUE } from 'src/constants';
import { CreateJournalistSearchDto } from './dto/create-journalist-search.dto';
import { UpdateJournalistSearchDto } from './dto/update-journalist-search.dto';
import { JournalistSearchService } from './journalist-search.service';

@Controller('journalist-search')
export class JournalistSearchController {
  constructor(
    private readonly journalistSearchService: JournalistSearchService,
    private configService: ConfigService
  ) {}

  @Post()
  create(@Headers('authorization') authorization: string, @Body() createJournalistSearchDto: CreateJournalistSearchDto) {
    return this.journalistSearchService.create(authorization, createJournalistSearchDto);
  }

  @Get()
  findAll(
    @Headers('authorization') authorization: string,
    @Query('marker') marker = '0',
    @Query('limit') limit = this.configService.get<string>(DEFAULT_PAGE_SIZE) ?? DEFAULT_PAGE_SIZE_VALUE,
    @Query('sort') sort = 'name:asc',
    @Query('name') name = ''
  ) {
    return this.journalistSearchService.findAll(authorization, marker, limit, sort, name);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.journalistSearchService.findOne(id);
  }

  @Put(':id')
  update(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Body() updateJournalistSearchDto: UpdateJournalistSearchDto
  ) {
    return this.journalistSearchService.update(authorization, id, updateJournalistSearchDto);
  }

  @Delete(':id')
  remove(@Headers('authorization') authorization: string, @Param('id') id: string) {
    return this.journalistSearchService.remove(authorization, id);
  }
}
