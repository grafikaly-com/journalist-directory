import { Injectable } from '@nestjs/common';
import { PrismaMediamineService, PrismaService } from 'src/db';
import { WinstonLoggerService } from 'src/logger';
import { resolveSort } from 'src/utils';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';

@Injectable()
export class PublicationService {
  constructor(
    private prisma: PrismaService,
    private prismaMediamine: PrismaMediamineService,
    private logger: WinstonLoggerService
  ) {
    this.logger.setContext(PublicationService.name);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(createPublicationDto: CreatePublicationDto) {
    return 'This action adds a new publication';
  }

  async findAll(marker: string, limit: string, sort: string, ids: Array<number>, name: string, country: string, hasJournalist: boolean) {
    this.logger.log(`invoked ${this.findAll.name} with ${JSON.stringify({ marker, limit, sort, ids, name, country, hasJournalist })}`);

    const [sortField, sortValue] = sort.split(':');
    const validSort = resolveSort(sortField, sortValue);

    const journalist_publications = await this.prismaMediamine?.journalist_publication.findMany({
      select: {
        publication_id: true
      }
    });

    const publications = await this.prisma?.publication.findMany({
      select: {
        id: true,
        name: true,
        region: {
          select: {
            name: true,
            country: {
              select: {
                name: true
              }
            }
          }
        },
        feed: {
          select: {
            id: true,
            name: true,
            broken_url: true
          }
        }
      },
      where: {
        name: {
          contains: name,
          mode: 'insensitive'
        },
        // Allow region to be null if country is not entered as a filter
        ...(country && {
          region: {
            country: {
              name: {
                contains: country
              }
            }
          }
        }),
        ...(hasJournalist && {
          id: {
            in: journalist_publications?.map((p) => p.publication_id)
          }
        }),
        ...(ids && {
          id: {
            in: ids
          }
        })
      },
      orderBy: validSort ? { [sortField]: sortValue } : { name: 'asc' }
    });

    return {
      items: publications?.slice(Number(marker), Number(marker) + Number(limit)),
      marker,
      limit,
      total: publications?.length
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} publication`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updatePublicationDto: UpdatePublicationDto) {
    return `This action updates a #${id} publication`;
  }

  remove(id: number) {
    return `This action removes a #${id} publication`;
  }
}
