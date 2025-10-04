import { Module } from '@nestjs/common';
import { PrismaService } from 'src/db';
import { PublicationTierController } from './publication-tier.controller';
import { PublicationTierService } from './publication-tier.service';

@Module({
  controllers: [PublicationTierController],
  providers: [PublicationTierService, PrismaService]
})
export class PublicationTierModule {}
