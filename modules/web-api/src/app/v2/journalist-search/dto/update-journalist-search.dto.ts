import { PartialType } from '@nestjs/swagger';
import { CreateJournalistSearchDto } from './create-journalist-search.dto';

export class UpdateJournalistSearchDto extends PartialType(CreateJournalistSearchDto) {}
