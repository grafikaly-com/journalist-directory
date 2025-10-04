import { PartialType } from '@nestjs/swagger';
import { CreatePublicationTierDto } from './create-publication-tier.dto';

export class UpdatePublicationTierDto extends PartialType(CreatePublicationTierDto) {}
