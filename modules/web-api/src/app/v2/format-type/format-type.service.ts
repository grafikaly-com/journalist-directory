import { Injectable } from '@nestjs/common';
import { PrismaMediamineService } from 'src/db';
import { WinstonLoggerService } from 'src/logger';
import { resolveSort } from 'src/utils';
import { v4 as uuidv4 } from 'uuid';
import { CreateFormatTypeDto } from './dto/create-format-type.dto';
import { UpdateFormatTypeDto } from './dto/update-format-type.dto';
import { FormatType } from './entities/format-type.entity';

@Injectable()
export class FormatTypeService {
  constructor(
    private prismaMediamine: PrismaMediamineService,
    private logger: WinstonLoggerService
  ) {
    this.logger.setContext(FormatTypeService.name);
  }

  async create(createFormatTypeDto: CreateFormatTypeDto) {
    this.logger.log(`invoked ${this.create.name} with ${JSON.stringify({ createFormatTypeDto })}`);

    const formatType: FormatType = await this.prismaMediamine?.format_type.create({
      data: {
        uuid: uuidv4(),
        ...createFormatTypeDto
      }
    });

    return {
      formatType
    };
  }

  async findAll(marker: string, limit: string, sort: string, name: string) {
    this.logger.log(`invoked ${this.findAll.name} with ${JSON.stringify({ marker, limit, sort, name })}`);

    const [sortField, sortValue] = sort.split(':');
    const validSort = resolveSort(sortField, sortValue);

    const formatTypes = await this.prismaMediamine.format_type.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive'
        }
      },
      orderBy: validSort ? { [sortField]: sortValue } : { name: 'asc' }
    });

    return {
      items: formatTypes?.slice(Number(marker), Number(marker) + Number(limit)),
      marker,
      limit,
      total: formatTypes?.length
    };
  }

  async findOne(uuid: string) {
    this.logger.log(`invoked ${this.findOne.name} with ${JSON.stringify({ uuid })}`);

    const formatType: FormatType = await this.prismaMediamine.format_type.findFirstOrThrow({
      where: { uuid }
    });

    return {
      formatType
    };
  }

  async update(uuid: string, updateFormatTypeDto: UpdateFormatTypeDto) {
    this.logger.log(`invoked ${this.update.name} with ${JSON.stringify({ updateFormatTypeDto })}`);

    const formatTypeExisting: FormatType = await this.prismaMediamine?.format_type.findFirstOrThrow({
      select: {
        id: true
      },
      where: { uuid }
    });

    const formatType: FormatType = await this.prismaMediamine?.format_type.update({
      data: updateFormatTypeDto,
      where: {
        id: formatTypeExisting?.id
      }
    });

    return {
      formatType
    };
  }

  async remove(uuid: string) {
    this.logger.log(`invoked ${this.remove.name} with ${JSON.stringify({ uuid })}`);

    const formatTypeExisting: FormatType = await this.prismaMediamine?.format_type.findFirstOrThrow({
      where: { uuid }
    });

    const formatType: FormatType = await this.prismaMediamine?.format_type.delete({
      where: {
        id: formatTypeExisting?.id
      }
    });

    return {
      formatType
    };
  }
}
