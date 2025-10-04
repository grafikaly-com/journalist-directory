import { Module } from '@nestjs/common';
import { PrismaMediamineService, PrismaService } from 'src/db';
import { ZerobounceService } from 'src/external-services';
import { WinstonLoggerModule } from 'src/logger';
import { JournalistController } from './journalist.controller';
import { JournalistService } from './journalist.service';

@Module({
  imports: [WinstonLoggerModule],
  controllers: [JournalistController],
  providers: [JournalistService, PrismaService, PrismaMediamineService, ZerobounceService]
})
export class JournalistModule {}
