import { Module } from '@nestjs/common';
import { PrismaService } from 'src/db';
import { PublicationMediaTypeController } from './publication-media-type.controller';
import { PublicationMediaTypeService } from './publication-media-type.service';

@Module({
  controllers: [PublicationMediaTypeController],
  providers: [PublicationMediaTypeService, PrismaService]
})
export class PublicationMediaTypeModule {}
