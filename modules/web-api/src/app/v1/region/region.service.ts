import { Injectable } from '@nestjs/common';
import { PrismaMediamineService, PrismaService } from 'src/db';
import { WinstonLoggerService } from 'src/logger';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';

@Injectable()
export class RegionService {
  constructor(
    private prisma: PrismaService,
    private prismaMediamine: PrismaMediamineService,
    private logger: WinstonLoggerService
  ) {
    this.logger.setContext(RegionService.name);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(createRegionDto: CreateRegionDto) {
    return 'This action adds a new region';
  }

  async findAll(name: string, country: string, code: string, hasJournalist: boolean) {
    this.logger.log(`invoked ${this.findAll.name} with ${JSON.stringify({ name, country, code, hasJournalist })}`);

    const journalist_regions = await this.prismaMediamine?.journalist_region.findMany({
      select: {
        region_id: true
      }
    });

    const regions = await this.prisma?.region.findMany({
      select: {
        id: true,
        name: true,
        country: {
          select: {
            name: true
          }
        }
      },
      where: {
        name: {
          contains: name,
          not: {
            equals: ''
          }
        },
        country: {
          name: {
            contains: country
          },
          ...(code && {
            code
          })
        },
        ...(hasJournalist && {
          id: {
            in: journalist_regions?.map((r) => r.region_id)
          }
        })
      },
      orderBy: { name: 'asc' }
    });

    return {
      items: regions,
      total: regions?.length
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} region`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateRegionDto: UpdateRegionDto) {
    return `This action updates a #${id} region`;
  }

  remove(id: number) {
    return `This action removes a #${id} region`;
  }
}
