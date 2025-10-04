import { Module } from '@nestjs/common';
import { PrismaMediamineService } from 'src/db/prisma-mediamine/prisma-mediamine.service';
import { RoleTypeController } from './role-type.controller';
import { RoleTypeService } from './role-type.service';

@Module({
  controllers: [RoleTypeController],
  providers: [RoleTypeService, PrismaMediamineService]
})
export class RoleTypeModule {}
