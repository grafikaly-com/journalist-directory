import { Module } from '@nestjs/common';
import { PrismaMediamineService, PrismaService } from 'src/db';
import { UserSessionService } from './user-session.service';
import { UserService } from './user.service';

@Module({
  providers: [UserService, UserSessionService, PrismaService, PrismaMediamineService],
  exports: [UserService, UserSessionService]
})
export class UserModule {}
