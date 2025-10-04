import { Injectable } from '@nestjs/common';
import { PrismaMediamineService } from 'src/db';
import { WinstonLoggerService } from 'src/logger';
import { resolveSort } from 'src/utils';
import { v4 as uuidv4 } from 'uuid';
import { CreateRoleTypeDto } from './dto/create-role-type.dto';
import { UpdateRoleTypeDto } from './dto/update-role-type.dto';
import { RoleType } from './entities/role-type.entity';

@Injectable()
export class RoleTypeService {
  constructor(
    private prismaMediamine: PrismaMediamineService,
    private logger: WinstonLoggerService
  ) {
    this.logger.setContext(RoleTypeService.name);
  }

  async create(createRoleTypeDto: CreateRoleTypeDto) {
    this.logger.log(`invoked ${this.create.name} with ${JSON.stringify({ createRoleTypeDto })}`);

    const newsType: RoleType = await this.prismaMediamine?.role_type.create({
      data: {
        uuid: uuidv4(),
        ...createRoleTypeDto
      }
    });

    return {
      newsType
    };
  }

  async findAll(marker: string, limit: string, sort: string, name: string) {
    this.logger.log(`invoked ${this.findAll.name} with ${JSON.stringify({ marker, limit, sort, name })}`);

    const [sortField, sortValue] = sort.split(':');
    const validSort = resolveSort(sortField, sortValue);

    const roleTypes = await this.prismaMediamine?.role_type.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive'
        }
      },
      orderBy: validSort ? { [sortField]: sortValue } : { name: 'asc' }
    });

    return {
      items: roleTypes?.slice(Number(marker), Number(marker) + Number(limit)),
      marker,
      limit,
      total: roleTypes?.length
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} roleType`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateRoleTypeDto: UpdateRoleTypeDto) {
    return `This action updates a #${id} roleType`;
  }

  remove(id: number) {
    return `This action removes a #${id} roleType`;
  }
}
