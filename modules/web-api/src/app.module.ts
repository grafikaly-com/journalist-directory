import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  FormatTypeModule,
  JournalistModule,
  JournalistSearchModule,
  NewsTypeModule,
  PublicationMediaTypeModule,
  PublicationModule,
  PublicationTierModule,
  RegionModule,
  RoleTypeModule
} from 'src/app';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './auth/user/user.module';
import { PrismaMediamineService, PrismaService } from './db';
import { ZerobounceService } from './external-services';
import { WinstonLoggerModule, WinstonLoggerService } from './logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env', '.env.dev', '.env.prod']
    }),
    PublicationMediaTypeModule,
    PublicationTierModule,
    PublicationModule,
    RegionModule,
    FormatTypeModule,
    JournalistSearchModule,
    JournalistModule,
    NewsTypeModule,
    RoleTypeModule,
    AuthModule,
    UserModule,
    WinstonLoggerModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaMediamineService, PrismaService, ZerobounceService, WinstonLoggerService]
})
export class AppModule {}
