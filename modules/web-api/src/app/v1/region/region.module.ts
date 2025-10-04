import { Module } from '@nestjs/common';
import { PrismaMediamineService, PrismaService } from 'src/db';
import { RegionController } from './region.controller';
import { RegionService } from './region.service';

@Module({
  controllers: [RegionController],
  providers: [RegionService, PrismaService, PrismaMediamineService]
})
export class RegionModule {}
