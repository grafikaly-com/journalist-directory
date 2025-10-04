import { Module } from '@nestjs/common';
import { PrismaMediamineService, PrismaService } from 'src/db';
import { PublicationController } from './publication.controller';
import { PublicationService } from './publication.service';

@Module({
  controllers: [PublicationController],
  providers: [PublicationService, PrismaService, PrismaMediamineService]
})
export class PublicationModule {}
