import { PartialType } from '@nestjs/swagger';
import { CreateNewsTypeDto } from './create-news-type.dto';

export class UpdateNewsTypeDto extends PartialType(CreateNewsTypeDto) {}
