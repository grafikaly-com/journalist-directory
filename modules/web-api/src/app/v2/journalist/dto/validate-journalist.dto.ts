import { PartialType } from '@nestjs/mapped-types';
import { ExportJournalistDto } from './export-journalist.dto';

export class ValidateJournalistDto extends PartialType(ExportJournalistDto) {}
