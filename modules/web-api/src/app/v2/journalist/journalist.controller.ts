import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth } from '@nestjs/swagger';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_VALUE } from 'src/constants';
import { CreateJournalistDto } from './dto/create-journalist.dto';
import { ExportJournalistDto } from './dto/export-journalist.dto';
import { UpdateJournalistDto } from './dto/update-journalist.dto';
import { UpdateJournalistsDto } from './dto/update-journalists.dto';
import { UserApproveJournalistDto } from './dto/user-approve-journalists.dto';
import { ValidateEmailsDto } from './dto/validate-emails.dto';
import { ValidateJournalistDto } from './dto/validate-journalist.dto';
import { JournalistService } from './journalist.service';

@ApiBearerAuth()
@Controller('journalist')
export class JournalistController {
  constructor(
    private readonly journalistService: JournalistService,
    private configService: ConfigService
  ) {}

  @Post()
  create(@Body() createJournalistDto: CreateJournalistDto) {
    if (!createJournalistDto.email) {
      throw new BadRequestException('Journalist is missing an email');
    }

    return this.journalistService.create(createJournalistDto);
  }

  @Get()
  findAll(
    @Query('marker') marker = '0',
    @Query('limit') limit = this.configService.get<string>(DEFAULT_PAGE_SIZE) ?? DEFAULT_PAGE_SIZE_VALUE,
    @Query('sort') sort = 'first_name:asc',
    @Query('name') name = '',
    @Query('formatTypeIds') formatTypeIds: Array<number>,
    @Query('newsTypeIds') newsTypeIds: Array<number>,
    @Query('roleTypeIds') roleTypeIds: Array<number>,
    @Query('publicationIds') publicationIds: Array<number>,
    @Query('publicationMediatypes') publicationMediatypes: Array<string>,
    @Query('publicationTiers') publicationTiers: Array<string>,
    @Query('regionIds') regionIds: Array<number>,
    @Query('journalistIds') journalistIds: Array<string>,
    @Query('validEmail') validEmail = 'true',
    @Query('enabled') enabled = 'true'
  ) {
    return this.journalistService.findAll(
      marker,
      limit,
      sort,
      name,
      formatTypeIds,
      newsTypeIds,
      roleTypeIds,
      publicationIds,
      publicationMediatypes,
      publicationTiers,
      regionIds,
      journalistIds,
      validEmail,
      enabled
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.journalistService.findOne(id);
  }

  @Put('batch')
  updateMany(@Body() updateJournalistsDto: UpdateJournalistsDto) {
    return this.journalistService.updateMany(updateJournalistsDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateJournalistDto: UpdateJournalistDto) {
    return this.journalistService.update(id, updateJournalistDto);
  }

  @Put(':id/archive')
  archive(@Param('id') id: string) {
    return this.journalistService.archive(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.journalistService.remove(id);
  }

  @Post('export')
  export(@Body() exportJournalistDto: ExportJournalistDto) {
    return this.journalistService.export(exportJournalistDto);
  }

  @Post('validate')
  validate(@Body() validateJournalistDto: ValidateJournalistDto) {
    return this.journalistService.validate(validateJournalistDto);
  }

  @Post('user-approve')
  userApprove(@Body() userApproveJournalistDto: UserApproveJournalistDto) {
    return this.journalistService.userApprove(userApproveJournalistDto);
  }

  @Post('validateEmails')
  validateEmails(@Body() validateEmailsDto: ValidateEmailsDto) {
    return this.journalistService.validateEmails(validateEmailsDto);
  }
}
