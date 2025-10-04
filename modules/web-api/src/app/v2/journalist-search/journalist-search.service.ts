import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaMediamineService, PrismaService } from 'src/db';
import { WinstonLoggerService } from 'src/logger';
import { resolveSort } from 'src/utils';
import { v4 as uuidv4 } from 'uuid';
import { CreateJournalistSearchDto } from './dto/create-journalist-search.dto';
import { UpdateJournalistSearchDto } from './dto/update-journalist-search.dto';

@Injectable()
export class JournalistSearchService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private prismaMediamine: PrismaMediamineService,
    private logger: WinstonLoggerService
  ) {
    this.logger.setContext(JournalistSearchService.name);
  }

  async create(authorization: string, createJournalistSearchDto: CreateJournalistSearchDto) {
    const [, token] = authorization.split(' ');
    const { username } = this.jwtService.decode(token);

    this.logger.log(`invoked ${this.create.name} with ${JSON.stringify({ username, createJournalistSearchDto })}`);

    const user = await this.prisma?.app_user.findFirstOrThrow({
      select: {
        id: true,
        name: true
      },
      where: {
        username
      }
    });

    if (!user?.id) {
      console.error('Unable to find user in database');
      return;
    }

    // Create the record in the database
    const { name, description, search, journalists } = createJournalistSearchDto;
    const journalistSearch = await this.prismaMediamine?.journalist_search.create({
      data: {
        uuid: uuidv4(),
        name,
        description,
        user_id: user?.id,
        search,
        journalists
      }
    });

    return {
      journalistSearch
    };
  }

  async findAll(authorization: string, marker: string, limit: string, sort: string, name: string) {
    const [, token] = authorization.split(' ');
    const { username } = this.jwtService.decode(token);

    this.logger.log(`invoked ${this.findAll.name} with ${JSON.stringify({ username, marker, limit, sort, name })}`);

    const [sortField, sortValue] = sort.split(':');
    const validSort = resolveSort(sortField, sortValue);

    const user = await this.prisma?.app_user.findFirstOrThrow({
      select: {
        id: true,
        name: true
      },
      where: {
        username
      }
    });

    if (!user?.id) {
      console.error('Unable to find user in database');
      return;
    }

    const journalistSearchs = await this.prismaMediamine?.journalist_search.findMany({
      where: {
        user_id: user?.id
      },
      orderBy: validSort ? { [sortField]: sortValue } : { name: 'asc' }
    });

    return {
      items: journalistSearchs,
      total: journalistSearchs?.length
    };
  }

  findOne(id: string) {
    return `This action returns a #${id} journalistSearch`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(authorization: string, id: string, updateJournalistSearchDto: UpdateJournalistSearchDto) {
    const [, token] = authorization.split(' ');
    const { username } = this.jwtService.decode(token);

    this.logger.log(`invoked ${this.update.name} with ${JSON.stringify({ username, id, updateJournalistSearchDto })}`);

    const user = await this.prisma?.app_user.findFirstOrThrow({
      select: {
        id: true,
        name: true
      },
      where: {
        username
      }
    });

    if (!user?.id) {
      console.error('Unable to find user in database');
      return;
    }

    const journalistSearchExisting = await this.prismaMediamine?.journalist_search.findFirstOrThrow({
      select: {
        id: true
      },
      where: {
        uuid: id
      }
    });

    // Create the record in the database
    const { name, description, search, journalists } = updateJournalistSearchDto;
    const journalistSearch = await this.prismaMediamine?.journalist_search.update({
      data: {
        name,
        description,
        user_id: user?.id,
        search,
        journalists
      },
      where: {
        id: journalistSearchExisting?.id
      }
    });

    return {
      journalistSearch
    };
  }

  async remove(authorization: string, id: string) {
    const [, token] = authorization.split(' ');
    const { username } = this.jwtService.decode(token);

    this.logger.log(`invoked ${this.remove.name} with ${JSON.stringify({ username, id })}`);

    const user = await this.prisma?.app_user.findFirstOrThrow({
      select: {
        id: true,
        name: true
      },
      where: {
        username
      }
    });

    if (!user?.id) {
      console.error('Unable to find user in database');
      return;
    }

    const journalistSearchExisting = await this.prismaMediamine?.journalist_search.findFirstOrThrow({
      where: {
        uuid: id
      }
    });

    const journalist = await this.prismaMediamine?.journalist_search.delete({
      where: {
        id: journalistSearchExisting?.id
      }
    });

    return { journalist };
  }
}
