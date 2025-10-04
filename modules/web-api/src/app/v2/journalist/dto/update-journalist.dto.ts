import { PartialType } from '@nestjs/mapped-types';
import { CreateJournalistDto } from './create-journalist.dto';

export class UpdateJournalistDto extends PartialType(CreateJournalistDto) {}
