import { Injectable } from '@nestjs/common';
import { PrismaMediamineService } from 'src/db';
import { WinstonLoggerService } from 'src/logger';
import { resolveSort } from 'src/utils';
import { v4 as uuidv4 } from 'uuid';
import { CreateNewsTypeDto } from './dto/create-news-type.dto';
import { UpdateNewsTypeDto } from './dto/update-news-type.dto';
import { NewsType } from './entities/news-type.entity';

@Injectable()
export class NewsTypeService {
  constructor(
    private prismaMediamine: PrismaMediamineService,
    private logger: WinstonLoggerService
  ) {
    this.logger.setContext(NewsTypeService.name);
  }

  async create(createNewsTypeDto: CreateNewsTypeDto) {
    this.logger.log(`invoked ${this.create.name} with ${JSON.stringify({ createNewsTypeDto })}`);

    const newsType: NewsType = await this.prismaMediamine?.news_type.create({
      data: {
        uuid: uuidv4(),
        ...createNewsTypeDto
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

    const newsTypes: Array<NewsType> = await this.prismaMediamine.news_type.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive'
        }
      },
      orderBy: validSort ? { [sortField]: sortValue } : { name: 'asc' }
    });

    return {
      items: newsTypes?.slice(Number(marker), Number(marker) + Number(limit)),
      marker,
      limit,
      total: newsTypes?.length
    };
  }

  async findOne(uuid: string) {
    this.logger.log(`invoked ${this.findOne.name} with ${JSON.stringify({ uuid })}`);

    const newsType: NewsType = await this.prismaMediamine.news_type.findFirstOrThrow({
      where: { uuid }
    });

    return {
      newsType
    };
  }

  async update(uuid: string, updateNewsTypeDto: UpdateNewsTypeDto) {
    this.logger.log(`invoked ${this.update.name} with ${JSON.stringify({ updateNewsTypeDto })}`);

    const newsTypeExisting: NewsType = await this.prismaMediamine?.news_type.findFirstOrThrow({
      select: {
        id: true
      },
      where: { uuid }
    });

    const newsType: NewsType = await this.prismaMediamine?.news_type.update({
      data: updateNewsTypeDto,
      where: {
        id: newsTypeExisting?.id
      }
    });

    return {
      newsType
    };
  }

  async remove(uuid: string) {
    this.logger.log(`invoked ${this.remove.name} with ${JSON.stringify({ uuid })}`);

    const newsTypeExisting: NewsType = await this.prismaMediamine?.news_type.findFirstOrThrow({
      where: { uuid }
    });

    const newsType: NewsType = await this.prismaMediamine?.news_type.delete({
      where: {
        id: newsTypeExisting?.id
      }
    });

    return {
      newsType
    };
  }
}
