import { Module } from '@nestjs/common';
import { PrismaMediamineService } from 'src/db/prisma-mediamine/prisma-mediamine.service';
import { NewsTypeController } from './news-type.controller';
import { NewsTypeService } from './news-type.service';

@Module({
  controllers: [NewsTypeController],
  providers: [NewsTypeService, PrismaMediamineService]
})
export class NewsTypeModule {}
