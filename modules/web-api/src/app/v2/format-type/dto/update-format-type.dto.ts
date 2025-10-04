import { PartialType } from '@nestjs/mapped-types';
import { CreateFormatTypeDto } from './create-format-type.dto';

export class UpdateFormatTypeDto extends PartialType(CreateFormatTypeDto) {}
