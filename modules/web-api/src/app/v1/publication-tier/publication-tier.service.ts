import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db';
import { WinstonLoggerService } from 'src/logger';
import { CreatePublicationTierDto } from './dto/create-publication-tier.dto';
import { UpdatePublicationTierDto } from './dto/update-publication-tier.dto';

@Injectable()
export class PublicationTierService {
  constructor(
    private prisma: PrismaService,
    private logger: WinstonLoggerService
  ) {
    this.logger.setContext(PublicationTierService.name);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(createPublicationTierDto: CreatePublicationTierDto) {
    return 'This action adds a new publicationTier';
  }

  async findAll(name: string) {
    this.logger.log(`invoked ${this.findAll.name} with ${JSON.stringify({ name })}`);

    const TIERS_DB = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5'];

    const publicationTiers = await this.prisma?.tag.findMany({
      select: {
        id: true,
        name: true
      },
      where: {
        name: {
          contains: name,
          not: {
            equals: ''
          },
          in: TIERS_DB
        }
      },
      orderBy: { name: 'asc' }
    });

    return {
      items: publicationTiers,
      total: publicationTiers?.length
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} publicationTier`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updatePublicationTierDto: UpdatePublicationTierDto) {
    return `This action updates a #${id} publicationTier`;
  }

  remove(id: number) {
    return `This action removes a #${id} publicationTier`;
  }
}
