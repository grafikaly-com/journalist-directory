import { PartialType } from '@nestjs/swagger';
import { CreatePublicationMediaTypeDto } from './create-publication-media-type.dto';

export class UpdatePublicationMediaTypeDto extends PartialType(CreatePublicationMediaTypeDto) {}
