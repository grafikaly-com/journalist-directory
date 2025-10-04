import { Module } from '@nestjs/common';
import { PrismaMediamineService, PrismaService } from 'src/db';
import { JournalistSearchController } from './journalist-search.controller';
import { JournalistSearchService } from './journalist-search.service';

@Module({
  controllers: [JournalistSearchController],
  providers: [JournalistSearchService, PrismaService, PrismaMediamineService]
})
export class JournalistSearchModule {}
