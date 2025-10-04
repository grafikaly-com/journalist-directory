import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db';
import { WinstonLoggerService } from 'src/logger';
import { CreatePublicationMediaTypeDto } from './dto/create-publication-media-type.dto';
import { UpdatePublicationMediaTypeDto } from './dto/update-publication-media-type.dto';

@Injectable()
export class PublicationMediaTypeService {
  constructor(
    private prisma: PrismaService,
    private logger: WinstonLoggerService
  ) {
    this.logger.setContext(PublicationMediaTypeService.name);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(createPublicationMediaTypeDto: CreatePublicationMediaTypeDto) {
    return 'This action adds a new publicationMediaType';
  }

  async findAll(name: string, publicationIds: Array<number>) {
    this.logger.log(`invoked ${this.findAll.name} with ${JSON.stringify({ name, publicationIds })}`);

    const publicationMediaTypes = await this.prisma?.publication_mediatype.findMany({
      select: {
        mediatype: true
      },
      distinct: ['mediatype'],
      where: {
        mediatype: {
          contains: name,
          not: {
            equals: ''
          }
        },
        owner_id: { in: publicationIds }
      },
      orderBy: { mediatype: 'asc' }
    });

    return {
      items: publicationMediaTypes,
      total: publicationMediaTypes?.length
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} publicationMediaType`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updatePublicationMediaTypeDto: UpdatePublicationMediaTypeDto) {
    return `This action updates a #${id} publicationMediaType`;
  }

  remove(id: number) {
    return `This action removes a #${id} publicationMediaType`;
  }
}
