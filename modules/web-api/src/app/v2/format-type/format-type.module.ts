import { Module } from '@nestjs/common';
import { PrismaMediamineService } from 'src/db/prisma-mediamine/prisma-mediamine.service';
import { FormatTypeController } from './format-type.controller';
import { FormatTypeService } from './format-type.service';

@Module({
  controllers: [FormatTypeController],
  providers: [FormatTypeService, PrismaMediamineService]
})
export class FormatTypeModule {}
