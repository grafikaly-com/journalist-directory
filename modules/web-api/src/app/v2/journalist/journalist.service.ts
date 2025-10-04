import { Injectable } from '@nestjs/common';
import { json2csv } from 'json-2-csv';
import { DateTime } from 'luxon';
import { PublicationMediaType } from 'src/app/v1/publication-media-type/entities/publication-media-type.entity';
import { PublicationTag } from 'src/app/v1/publication-tier/entities/publication-tag.entity';
import { Tag } from 'src/app/v1/publication-tier/entities/tag.entity';
import { Publication } from 'src/app/v1/publication/entities/publication.entity';
import { Region } from 'src/app/v1/region/entities/region.entity';
import { PrismaMediamineService, PrismaService } from 'src/db';
import { ZerobounceService } from 'src/external-services';
import { WinstonLoggerService } from 'src/logger';
import { resolveSort } from 'src/utils';
import { v4 as uuidv4 } from 'uuid';
import { CreateJournalistDto } from './dto/create-journalist.dto';
import { ExportJournalistDto } from './dto/export-journalist.dto';
import { UpdateJournalistDto } from './dto/update-journalist.dto';
import { UpdateJournalistsDto } from './dto/update-journalists.dto';
import { UserApproveJournalistDto } from './dto/user-approve-journalists.dto';
import { ValidateEmailsDto } from './dto/validate-emails.dto';
import { ValidateJournalistDto } from './dto/validate-journalist.dto';
import { JournalistPublication } from './entities/journalist-publication.entity';
import { JournalistRegion } from './entities/journalist-region.entity';

@Injectable()
export class JournalistService {
  constructor(
    private prisma: PrismaService,
    private prismaMediamine: PrismaMediamineService,
    private logger: WinstonLoggerService,
    private zerobounceService: ZerobounceService
  ) {
    this.logger.setContext(JournalistService.name);
  }

  async create(createJournalistDto: CreateJournalistDto) {
    this.logger.log(`invoked ${this.create.name} with ${JSON.stringify({ createJournalistDto })}`);

    const {
      firstName,
      lastName,
      email,
      phone,
      ddi,
      mobile,
      linkedin,
      twitter,
      datasource,
      formatTypeIds = [],
      newsTypeIds = [],
      roleTypeIds = [],
      roleToFeedMap = new Map(),
      publicationIds = [],
      regionIds = []
    } = createJournalistDto;

    // Create the record in the database
    const journalist = await this.prismaMediamine?.journalist.create({
      data: {
        uuid: uuidv4(),
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        ddi,
        mobile,
        linkedin,
        twitter,
        datasource,
        format_types: {
          create: formatTypeIds.map((ftid) => ({
            format_type: {
              connect: {
                id: ftid
              }
            }
          }))
        },
        news_types: {
          create: newsTypeIds.map((ntid) => ({
            news_type: {
              connect: {
                id: ntid
              }
            }
          }))
        },
        ...(roleTypeIds && {
          role_types: {
            create: roleTypeIds.map((rtid) => ({
              role_type: {
                connect: {
                  id: rtid
                }
              }
            }))
          }
        }),
        ...(roleToFeedMap && {
          role_types: {
            create: Object.entries(roleToFeedMap).map(([rtid, feedId]) => ({
              role_type: {
                connect: {
                  id: Number(rtid)
                }
              },
              feed_id: feedId
            }))
          }
        }),
        ...(publicationIds && {
          publications: {
            createMany: {
              data: publicationIds.map((pid) => ({ publication_id: pid }))
            }
          }
        }),
        ...(regionIds && {
          regions: {
            createMany: {
              data: regionIds.map((rid) => ({ region_id: rid }))
            }
          }
        })
      }
    });

    return {
      journalist
    };
  }

  async findAll(
    marker: string,
    limit: string,
    sort: string,
    name: string,
    formatTypeIds: Array<number>,
    newsTypeIds: Array<number>,
    roleTypeIds: Array<number>,
    publicationIds: Array<number>,
    publicationMediatypes: Array<string>,
    publicationTiers: Array<string>,
    regionIds: Array<number>,
    journalistIds: Array<string>,
    validEmail: string,
    enabled: string
  ) {
    this.logger.log(
      `invoked ${this.findAll.name} with ${JSON.stringify({
        marker,
        limit,
        sort,
        name,
        formatTypeIds,
        newsTypeIds,
        roleTypeIds,
        publicationIds,
        publicationMediatypes,
        publicationTiers,
        regionIds,
        journalistIds,
        validEmail,
        enabled
      })}`
    );

    const [sortField, sortValue] = sort.split(':');
    const orderBy = resolveSort(sortField, sortValue);

    const TIERS_DB = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5'];

    const tiers: Array<Tag> = await this.prisma?.tag.findMany({
      where: {
        name: {
          in:
            publicationTiers?.filter((pt: string) => TIERS_DB.includes(pt)) ??
            // Fallback to all Tiers if publicationTiers param is not set
            TIERS_DB
        }
      }
    });

    const publicationsWithMediatypesOrTiers: Array<Publication> = await this.prisma?.publication.findMany({
      select: {
        id: true,
        name: true
      },
      where: {
        ...(publicationIds && { id: { in: publicationIds } }),
        ...(publicationMediatypes && { publication_mediatype: { some: { mediatype: { in: publicationMediatypes } } } }),
        ...(publicationTiers && tiers && { publication_tag: { some: { tag_id: { in: tiers?.map((t) => t.id) } } } })
      }
    });

    const journalists = await this.prismaMediamine?.journalist.findMany({
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        uuid: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        ddi: true,
        mobile: true,
        valid_email: true,
        user_approved: true,
        format_types: true,
        news_types: true,
        role_types: true,
        publications: true,
        regions: true
      },
      where: {
        enabled: enabled === 'true',
        AND: [
          /**
           * validEmail url param is resolved into the following condition
           * 1. if true, resolve the sql query into `valid_email = 'true' OR  user_approved = 'true'`
           * 2. if false, resolve the sql query into `valid_email = 'false' AND  user_approved = 'false'`
           */
          {
            ...(validEmail === 'true'
              ? { OR: [{ valid_email: true }, { user_approved: true }] }
              : { AND: [{ valid_email: false }, { user_approved: false }] })
          },
          {
            OR: [
              {
                first_name: {
                  // TODO: Needs to honour all the search keywords and not only the first
                  contains: name?.split(' ')[0],
                  mode: 'insensitive'
                }
              },
              {
                last_name: {
                  // TODO: Needs to honour all the search keywords and not only the first
                  contains: name?.split(' ')[0],
                  mode: 'insensitive'
                }
              }
            ]
          }
        ],
        ...(formatTypeIds && {
          format_types: { some: { format_type_id: { in: formatTypeIds } } }
        }),
        ...(newsTypeIds && {
          news_types: { some: { news_type_id: { in: newsTypeIds } } }
        }),
        ...(roleTypeIds && {
          role_types: { some: { role_type_id: { in: roleTypeIds } } }
        }),
        ...(regionIds && {
          regions: { some: { region_id: { in: regionIds } } }
        }),
        ...((publicationIds || publicationMediatypes || publicationTiers) && {
          publications: { some: { publication_id: { in: publicationsWithMediatypesOrTiers?.map((p) => p.id) } } }
        }),
        ...(journalistIds && {
          uuid: { in: journalistIds }
        })
      },
      orderBy
    });

    const journalistsCurrentPage = journalists?.slice(Number(marker), Number(marker) + Number(limit));

    const journalist_format_types = await this.prismaMediamine?.journalist_format_type.findMany({
      where: {
        journalist_id: {
          in: journalistsCurrentPage?.map((j) => j.id)
        }
      }
    });
    const format_types = await this.prismaMediamine?.format_type.findMany({
      select: {
        id: true,
        name: true
      },
      where: {
        id: {
          in: journalist_format_types?.map((j) => j.format_type_id)
        }
      }
    });

    const journalist_news_types = await this.prismaMediamine?.journalist_news_type.findMany({
      where: {
        journalist_id: {
          in: journalistsCurrentPage?.map((j) => j.id)
        }
      }
    });
    const news_types = await this.prismaMediamine?.news_type.findMany({
      select: {
        id: true,
        name: true
      },
      where: {
        id: {
          in: journalist_news_types?.map((j) => j.news_type_id)
        }
      }
    });

    const journalist_role_types = await this.prismaMediamine?.journalist_role_type.findMany({
      where: {
        journalist_id: {
          in: journalistsCurrentPage?.map((j) => j.id)
        }
      }
    });
    const role_types = await this.prismaMediamine?.role_type.findMany({
      select: {
        id: true,
        name: true
      },
      where: {
        id: {
          in: journalist_role_types?.map((j) => j.role_type_id)
        }
      }
    });

    const journalist_publications = await this.prismaMediamine?.journalist_publication.findMany({
      where: {
        journalist_id: {
          in: journalistsCurrentPage?.map((j) => j.id)
        }
      }
    });
    const publications: Array<Publication> = await this.prisma?.publication.findMany({
      select: {
        id: true,
        name: true
      },
      where: {
        id: {
          in: journalist_publications?.map((j) => j.publication_id)
        }
      }
    });
    const publication_mediatypes: Array<PublicationMediaType> = await this.prisma?.publication_mediatype.findMany({
      select: {
        owner_id: true,
        mediatype: true
      },
      where: {
        owner_id: {
          in: journalist_publications?.map((j) => j.publication_id)
        },
        ...(publicationMediatypes && { mediatype: { in: publicationMediatypes } })
      }
    });
    const publication_tiers: Array<PublicationTag> = await this.prisma?.publication_tag.findMany({
      select: {
        publication_id: true,
        tag_id: true
      },
      where: {
        publication_id: {
          in: journalist_publications?.map((j) => j.publication_id)
        },
        tag_id: { in: tiers?.map((t) => t.id) }
      }
    });

    const journalist_regions: Array<JournalistRegion> = await this.prismaMediamine?.journalist_region.findMany({
      where: {
        journalist_id: {
          in: journalistsCurrentPage?.map((j) => j.id)
        }
      }
    });
    const regions: Array<Region> = await this.prisma?.region.findMany({
      select: {
        id: true,
        name: true
      },
      where: {
        id: {
          in: journalist_regions?.map((j) => j.region_id)
        }
      }
    });

    return {
      items: journalistsCurrentPage?.map((j) => ({
        ...j,
        format_types: format_types?.filter((nt) =>
          journalist_format_types
            ?.filter((jnt) => jnt.journalist_id === j.id)
            .map((jnt) => jnt.format_type_id)
            .includes(nt.id)
        ),
        news_types: news_types?.filter((nt) =>
          journalist_news_types
            ?.filter((jnt) => jnt.journalist_id === j.id)
            .map((jnt) => jnt.news_type_id)
            .includes(nt.id)
        ),
        role_types: role_types?.filter((rt) =>
          journalist_role_types
            ?.filter((jrt) => jrt.journalist_id === j.id)
            .map((jrt) => jrt.role_type_id)
            .includes(rt.id)
        ),
        roleToFeedMap: journalist_role_types
          ?.filter((jrt) => jrt.journalist_id === j.id)
          .reduce((memo: { [key: string]: string | null }, rt) => {
            memo[String(rt.role_type_id)] = rt.feed_id ? String(rt.feed_id) : null;
            return memo;
          }, {}),
        publications: publications
          ?.filter((p) =>
            journalist_publications
              ?.filter((jp) => jp.journalist_id === j.id)
              .map((jp) => jp.publication_id)
              .includes(p.id)
          )
          .map((p) => ({
            ...p,
            mediatypes: publication_mediatypes?.filter((pm) => pm.owner_id === p.id).map((pm) => pm.mediatype),
            tiers: tiers
              ?.filter((t) =>
                publication_tiers
                  ?.filter((pt) => pt.publication_id === p.id)
                  .map((pt) => pt.tag_id)
                  .includes(t.id)
              )
              .map((t) => t.name)
          })),
        regions: regions?.filter((r) =>
          journalist_regions
            ?.filter((jr) => jr.journalist_id === j.id)
            .map((jr) => jr.region_id)
            .includes(r.id)
        )
      })),
      marker,
      limit,
      total: journalists?.length
    };
  }

  async findOne(id: string) {
    this.logger.log(`invoked ${this.findOne.name} with ${JSON.stringify({ id })}`);

    const TIERS_DB = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5'];
    const tiers: Array<Tag> = await this.prisma?.tag.findMany({
      where: {
        name: {
          in: TIERS_DB
        }
      }
    });

    const journalist = await this.prismaMediamine?.journalist.findFirstOrThrow({
      where: {
        uuid: id
      }
    });

    const journalist_format_types = await this.prismaMediamine?.journalist_format_type.findMany({
      where: {
        journalist_id: journalist?.id
      }
    });
    const format_types = await this.prismaMediamine?.format_type.findMany({
      select: {
        id: true,
        name: true
      },
      where: {
        id: {
          in: journalist_format_types?.map((j) => j.format_type_id)
        }
      }
    });

    const journalist_news_types = await this.prismaMediamine?.journalist_news_type.findMany({
      where: {
        journalist_id: journalist?.id
      }
    });
    const news_types = await this.prismaMediamine?.news_type.findMany({
      select: {
        id: true,
        name: true
      },
      where: {
        id: {
          in: journalist_news_types?.map((j) => j.news_type_id)
        }
      }
    });

    const journalist_role_types = await this.prismaMediamine?.journalist_role_type.findMany({
      where: {
        journalist_id: journalist?.id
      }
    });
    const role_types = await this.prismaMediamine?.role_type.findMany({
      select: {
        id: true,
        name: true
      },
      where: {
        id: {
          in: journalist_role_types?.map((j) => j.role_type_id)
        }
      }
    });
    const roleToFeedMap = journalist_role_types.reduce((memo: { [key: string]: string | null }, rt) => {
      memo[String(rt.role_type_id)] = rt.feed_id ? String(rt.feed_id) : null;
      return memo;
    }, {});

    const journalist_publications: Array<JournalistPublication> = await this.prismaMediamine?.journalist_publication.findMany({
      where: {
        journalist_id: journalist?.id
      }
    });
    const publications: Array<Publication> = await this.prisma?.publication.findMany({
      select: {
        id: true,
        name: true
      },
      where: {
        id: {
          in: journalist_publications?.map((j) => j.publication_id)
        }
      }
    });
    const publication_mediatypes: Array<PublicationMediaType> = await this.prisma?.publication_mediatype.findMany({
      select: {
        owner_id: true,
        mediatype: true
      },
      where: {
        owner_id: {
          in: journalist_publications?.map((j) => j.publication_id)
        }
      }
    });
    const publication_tiers: Array<PublicationTag> = await this.prisma?.publication_tag.findMany({
      select: {
        publication_id: true,
        tag_id: true
      },
      where: {
        publication_id: {
          in: journalist_publications?.map((j) => j.publication_id)
        },
        tag_id: { in: tiers?.map((t) => t.id) }
      }
    });

    const journalist_regions = await this.prismaMediamine?.journalist_region.findMany({
      where: {
        journalist_id: journalist?.id
      }
    });
    const regions = await this.prisma?.region.findMany({
      select: {
        id: true,
        name: true
      },
      where: {
        id: {
          in: journalist_regions?.map((j) => j.region_id)
        }
      }
    });

    return {
      ...journalist,
      format_types,
      news_types,
      role_types,
      roleToFeedMap,
      publications: publications
        ?.filter((p) =>
          journalist_publications
            ?.filter((jp) => jp.journalist_id === journalist?.id)
            .map((jp) => jp.publication_id)
            .includes(p.id)
        )
        .map((p) => ({
          ...p,
          mediatypes: publication_mediatypes?.filter((pm) => pm.owner_id === p.id).map((pm) => pm.mediatype),
          tiers: tiers
            ?.filter((t) =>
              publication_tiers
                ?.filter((pt) => pt.publication_id === p.id)
                .map((pt) => pt.tag_id)
                .includes(t.id)
            )
            .map((t) => t.name)
        })),
      regions
    };
  }

  async update(id: string, updateJournalistDto: UpdateJournalistDto) {
    this.logger.log(`invoked ${this.update.name} with ${JSON.stringify({ id, updateJournalistDto })}`);

    const {
      firstName,
      lastName,
      email,
      phone,
      ddi,
      mobile,
      linkedin,
      twitter,
      datasource,
      formatTypeIds = [],
      newsTypeIds = [],
      roleTypeIds = [],
      roleToFeedMap = new Map(),
      publicationIds = [],
      regionIds = []
    } = updateJournalistDto;

    const journalistExisting = await this.prismaMediamine?.journalist.findFirstOrThrow({
      select: {
        id: true
      },
      where: {
        uuid: id
      }
    });

    await this.prismaMediamine?.journalist_format_type.deleteMany({
      where: {
        journalist_id: journalistExisting?.id
      }
    });
    await this.prismaMediamine?.journalist_news_type.deleteMany({
      where: {
        journalist_id: journalistExisting?.id
      }
    });
    await this.prismaMediamine?.journalist_role_type.deleteMany({
      where: {
        journalist_id: journalistExisting?.id
      }
    });
    await this.prismaMediamine?.journalist_publication.deleteMany({
      where: {
        journalist_id: journalistExisting?.id
      }
    });
    await this.prismaMediamine?.journalist_region.deleteMany({
      where: {
        journalist_id: journalistExisting?.id
      }
    });

    const journalist = await this.prismaMediamine?.journalist.update({
      data: {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        ddi,
        mobile,
        linkedin,
        twitter,
        datasource,
        format_types: {
          create: formatTypeIds.map((ftid) => ({
            format_type: {
              connect: {
                id: ftid
              }
            }
          }))
        },
        news_types: {
          create: newsTypeIds.map((ntid) => ({
            news_type: {
              connect: {
                id: ntid
              }
            }
          }))
        },
        role_types: {
          create: Object.entries(roleToFeedMap).map(([rtid, feedId]) => ({
            role_type: {
              connect: {
                id: Number(rtid)
              }
            },
            feed_id: feedId
          }))
        },
        publications: {
          createMany: {
            data: publicationIds.map((pid) => ({ publication_id: pid }))
          }
        },
        regions: {
          createMany: {
            data: regionIds.map((rid) => ({ region_id: rid }))
          }
        }
      },
      where: {
        id: journalistExisting?.id
      }
    });

    return {
      journalist
    };
  }

  async archive(id: string) {
    this.logger.log(`invoked ${this.archive.name} with ${JSON.stringify({ id })}`);

    const journalistExisting = await this.prismaMediamine?.journalist.findFirstOrThrow({
      select: {
        id: true
      },
      where: {
        uuid: id
      }
    });

    const journalist = await this.prismaMediamine?.journalist.update({
      data: {
        enabled: false
      },
      where: {
        id: journalistExisting?.id
      }
    });

    return {
      journalist
    };
  }

  async remove(id: string) {
    this.logger.log(`invoked ${this.remove.name} with ${JSON.stringify({ id })}`);

    const journalistExisting = await this.prismaMediamine?.journalist.findFirstOrThrow({
      where: {
        uuid: id
      }
    });

    const journalist = await this.prismaMediamine?.journalist.delete({
      where: {
        id: journalistExisting?.id
      }
    });

    return {
      journalist
    };
  }

  async export(exportJournalistDto: ExportJournalistDto) {
    this.logger.log(`invoked ${this.export.name} with ${JSON.stringify({ exportJournalistDto })}`);

    const {
      ids,
      publicationMediatypes,
      publicationTiers,
      publicationIds,
      formatTypeIds,
      newsTypeIds,
      roleTypeIds,
      regionIds,
      selectAll,
      validEmail,
      enabled = true,
      sort,
      name = ''
    } = exportJournalistDto;

    const [sortField, sortValue] = sort.split(':');
    const orderBy = resolveSort(sortField, sortValue);

    const TIERS_DB = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5'];

    const tiers: Array<Tag> = await this.prisma?.tag.findMany({
      where: {
        name: {
          in: publicationTiers?.filter((pt: string) => TIERS_DB.includes(pt))
        }
      }
    });

    const publicationsWithMediatypesOrTiers: Array<Publication> = await this.prisma?.publication.findMany({
      select: {
        id: true,
        name: true
      },
      where: {
        ...(publicationIds && { id: { in: publicationIds } }),
        ...(publicationMediatypes && { publication_mediatype: { some: { mediatype: { in: publicationMediatypes } } } }),
        ...(publicationTiers && tiers && { publication_tag: { some: { tag_id: { in: tiers?.map((t) => t.id) } } } })
      }
    });

    const journalists = await this.prismaMediamine?.journalist.findMany({
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        uuid: true,
        first_name: true,
        last_name: true,
        email: true,
        ddi: true,
        mobile: true,
        valid_email: true,
        user_approved: true,
        format_types: true,
        news_types: true,
        role_types: true,
        publications: true,
        regions: true
      },
      where: {
        ...(!selectAll && { uuid: { in: ids } }),
        enabled,
        AND: [
          /**
           * validEmail url param is resolved into the following condition
           * 1. if true, resolve the sql query into `valid_email = 'true' OR  user_approved = 'true'`
           * 2. if false, resolve the sql query into `valid_email = 'false' AND  user_approved = 'false'`
           */
          {
            ...(validEmail
              ? { OR: [{ valid_email: true }, { user_approved: true }] }
              : { AND: [{ valid_email: false }, { user_approved: false }] })
          },
          {
            OR: [
              {
                first_name: {
                  // TODO: Needs to honour all the search keywords and not only the first
                  contains: name?.split(' ')[0],
                  mode: 'insensitive'
                }
              },
              {
                last_name: {
                  // TODO: Needs to honour all the search keywords and not only the first
                  contains: name?.split(' ')[0],
                  mode: 'insensitive'
                }
              }
            ]
          }
        ],
        ...(formatTypeIds && {
          format_types: { some: { format_type_id: { in: formatTypeIds } } }
        }),
        ...(newsTypeIds && {
          news_types: { some: { news_type_id: { in: newsTypeIds } } }
        }),
        ...(roleTypeIds && {
          role_types: { some: { role_type_id: { in: roleTypeIds } } }
        }),
        ...(regionIds && {
          regions: { some: { region_id: { in: regionIds } } }
        }),
        ...((publicationIds || publicationMediatypes || publicationTiers) && {
          publications: { some: { publication_id: { in: publicationsWithMediatypesOrTiers?.map((p) => p.id) } } }
        })
      },
      orderBy
    });

    // TODO: add a log for more than 200 count of exported rows

    const resp = await json2csv(
      journalists?.map((j) => ({ ...j, p: j.publications })),
      {
        keys: [
          'first_name',
          'email'
          // TODO: 'publications'
        ]
      }
    );

    return resp;
  }

  async validate(validateJournalistDto: ValidateJournalistDto) {
    this.logger.log(`invoked ${this.validate.name} with ${JSON.stringify({ validateJournalistDto })}`);

    const {
      ids,
      publicationMediatypes,
      publicationTiers,
      publicationIds,
      formatTypeIds,
      newsTypeIds,
      roleTypeIds,
      regionIds,
      selectAll,
      validEmail,
      sort = 'first_name:asc',
      name = ''
    } = validateJournalistDto;
    const limit = 100; // imposed by zerobounce as max size of an email validation batch (https://www.zerobounce.net/docs/email-validation-api-quickstart/#batch_validate_emails__v2__)
    const [sortField, sortValue] = sort.split(':');
    const orderBy = resolveSort(sortField, sortValue);

    const TIERS_DB = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5'];
    const tiers = await this.prisma?.tag.findMany({
      where: {
        name: {
          in: publicationTiers?.filter((pt: string) => TIERS_DB.includes(pt))
        }
      }
    });

    const publicationsWithMediatypesOrTiers = await this.prisma?.publication.findMany({
      select: {
        id: true,
        name: true
      },
      where: {
        ...(publicationIds && { id: { in: publicationIds } }),
        ...(publicationMediatypes && { publication_mediatype: { some: { mediatype: { in: publicationMediatypes } } } }),
        ...(publicationTiers && tiers && { publication_tag: { some: { tag_id: { in: tiers?.map((t: { id: bigint }) => Number(t.id)) } } } })
      }
    });

    const journalistsExisting = await this.prismaMediamine?.journalist.findMany({
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        uuid: true,
        first_name: true,
        last_name: true,
        email: true,
        mobile: true,
        valid_email: true,
        user_approved: true,
        format_types: true,
        news_types: true,
        role_types: true,
        publications: true,
        regions: true
      },
      where: {
        ...(!selectAll && { uuid: { in: ids } }),
        AND: [
          /**
           * validEmail attribute is resolved into the following condition
           * 1. if true, resolve the sql query into `valid_email = 'true' OR  user_approved = 'true'`
           * 2. if false, resolve the sql query into `valid_email = 'false' AND  user_approved = 'false'`
           */
          {
            ...(validEmail
              ? { OR: [{ valid_email: true }, { user_approved: true }] }
              : { AND: [{ valid_email: false }, { user_approved: false }] })
          },
          {
            OR: [
              {
                first_name: {
                  // TODO: Needs to honour all the search keywords and not only the first
                  contains: name?.split(' ')[0],
                  mode: 'insensitive'
                }
              },
              {
                last_name: {
                  // TODO: Needs to honour all the search keywords and not only the first
                  contains: name?.split(' ')[0],
                  mode: 'insensitive'
                }
              }
            ]
          }
        ],
        ...(formatTypeIds && {
          format_types: { some: { format_type_id: { in: formatTypeIds } } }
        }),
        ...(newsTypeIds && {
          news_types: { some: { news_type_id: { in: newsTypeIds } } }
        }),
        ...(roleTypeIds && {
          role_types: { some: { role_type_id: { in: roleTypeIds } } }
        }),
        ...(regionIds && {
          regions: { some: { region_id: { in: regionIds } } }
        }),
        ...((publicationIds || publicationMediatypes || publicationTiers) && {
          publications: { some: { publication_id: { in: publicationsWithMediatypesOrTiers?.map((p: { id: bigint }) => Number(p.id)) } } }
        })
      },
      orderBy
    });
    this.logger.log(
      `available journalists: ${JSON.stringify({
        journalistsExisting: journalistsExisting.map((j) => ({ id: j.id, name: `${j.first_name} ${j.last_name}` }))
      })}`
    );

    const journalistsExistingBatches = Array.from(
      { length: journalistsExisting ? Math.ceil(journalistsExisting?.length / Number(limit)) : 0 },
      (_, i) => journalistsExisting?.slice(i * limit, (i + 1) * limit)
    );

    const journalistsExistingBatchResponses: Array<Array<Record<string, string | bigint | boolean>>> = [];
    for (const journalistBatch of journalistsExistingBatches) {
      const response = await this.zerobounceService.validateBatch(
        journalistBatch?.map((j) => j.email).filter((email) => String(email).length > 0)
      );
      this.logger.debug(`response from ${this.zerobounceService.validateBatch.name} is ${JSON.stringify({ response })}`);

      journalistsExistingBatchResponses.push(
        journalistBatch.map((j) => {
          if (!j.email) {
            this.logger.debug(`blank email for ${j.id} was sent, hence updating this as invalid`);
            return {
              mediamineId: j.id,
              mediamineIsValidEmail: false
            };
          }

          const respJ = response!.email_batch.find((eb: Record<string, string>) => j.email.toLowerCase() === eb.address.toLowerCase());

          if (respJ) {
            return {
              ...respJ,
              mediamineId: j.id,
              mediamineIsValidEmail: this.zerobounceService.isEmailStatusValid(respJ.status, respJ.sub_status)
            };
          }

          this.logger.debug(`response for email ${j.email} is null, hence updating this as invalid`);
          return {
            mediamineId: j.id,
            mediamineIsValidEmail: false
          };
        })
      );
    }

    const items = journalistsExistingBatchResponses.reduce(
      (memo: Array<Record<string, string | bigint | boolean>>, item) => memo.concat(item),
      []
    );
    this.logger.log(`items: ${JSON.stringify({ items })}`);

    for (const item of items) {
      const { mediamineId, mediamineIsValidEmail, ...serviceResponse } = item;
      await this.prismaMediamine?.journalist.update({
        data: {
          valid_email: Boolean(mediamineIsValidEmail),
          validatedAt: DateTime.now().toISO(),
          service_response: JSON.stringify(serviceResponse)
        },
        where: {
          id: Number(mediamineId)
        }
      });
    }

    return {
      items,
      total: items.length
    };
  }

  async userApprove(userApproveJournalistDto: UserApproveJournalistDto) {
    this.logger.log(`invoked ${this.userApprove.name} with ${JSON.stringify({ userApproveJournalistDto })}`);

    const { ids, isUserApproved = true } = userApproveJournalistDto;

    const journalistsExisting = await this.prismaMediamine?.journalist.findMany({
      select: {
        id: true,
        email: true
      },
      where: {
        uuid: { in: ids }
      }
    });

    const journalists = await this.prismaMediamine?.journalist.updateMany({
      data: {
        user_approved: isUserApproved
      },
      where: {
        id: {
          in: journalistsExisting?.map((je) => je.id)
        }
      }
    });

    return {
      items: journalists,
      total: journalists?.count
    };
  }

  async validateEmails(validateEmailsDto: ValidateEmailsDto) {
    this.logger.log(`invoked ${this.validateEmails.name} with ${JSON.stringify({ validateEmailsDto })}`);

    const { emails } = validateEmailsDto;
    const response = await this.zerobounceService.validateBatch(emails);

    const items: Array<{ email: string; mediamineIsValidEmail: boolean }> | undefined =
      response?.email_batch.map((eb: Record<string, string>) => ({
        email: eb.address,
        mediamineIsValidEmail: this.zerobounceService.isEmailStatusValid(eb.status, eb.sub_status)
      })) ?? [];

    return {
      items,
      total: items?.length
    };
  }

  async updateMany(updateJournalistsDto: UpdateJournalistsDto) {
    this.logger.log(`invoked ${this.updateMany.name} with ${JSON.stringify({ updateJournalistsDto })}`);

    const {
      ids,
      publicationMediatypes,
      publicationTiers,
      publicationIds,
      formatTypeIds,
      newsTypeIds,
      roleTypeIds,
      regionIds,
      selectAll,
      validEmail,
      enabled,
      sort = 'first_name:asc',
      name = ''
    } = updateJournalistsDto;

    const [sortField, sortValue] = sort.split(':');
    const orderBy = resolveSort(sortField, sortValue);

    const TIERS_DB = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5'];

    const tiers: Array<Tag> = await this.prisma?.tag.findMany({
      where: {
        name: {
          in: publicationTiers?.filter((pt: string) => TIERS_DB.includes(pt))
        }
      }
    });

    const publicationsWithMediatypesOrTiers: Array<Publication> = await this.prisma?.publication.findMany({
      select: {
        id: true,
        name: true
      },
      where: {
        ...(publicationIds && { id: { in: publicationIds } }),
        ...(publicationMediatypes && { publication_mediatype: { some: { mediatype: { in: publicationMediatypes } } } }),
        ...(publicationTiers && tiers && { publication_tag: { some: { tag_id: { in: tiers?.map((t) => t.id) } } } })
      }
    });

    const journalistsExisting = await this.prismaMediamine?.journalist.findMany({
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        uuid: true,
        first_name: true,
        last_name: true,
        email: true,
        mobile: true,
        valid_email: true,
        user_approved: true,
        format_types: true,
        news_types: true,
        role_types: true,
        publications: true,
        regions: true
      },
      where: {
        ...(!selectAll && { uuid: { in: ids } }),
        AND: [
          /**
           * validEmail url param is resolved into the following condition
           * 1. if true, resolve the sql query into `valid_email = 'true' OR  user_approved = 'true'`
           * 2. if false, resolve the sql query into `valid_email = 'false' AND  user_approved = 'false'`
           */
          {
            ...(validEmail
              ? { OR: [{ valid_email: true }, { user_approved: true }] }
              : { AND: [{ valid_email: false }, { user_approved: false }] })
          },
          {
            OR: [
              {
                first_name: {
                  // TODO: Needs to honour all the search keywords and not only the first
                  contains: name?.split(' ')[0],
                  mode: 'insensitive'
                }
              },
              {
                last_name: {
                  // TODO: Needs to honour all the search keywords and not only the first
                  contains: name?.split(' ')[0],
                  mode: 'insensitive'
                }
              }
            ]
          }
        ],
        ...(formatTypeIds && {
          format_types: { some: { format_type_id: { in: formatTypeIds } } }
        }),
        ...(newsTypeIds && {
          news_types: { some: { news_type_id: { in: newsTypeIds } } }
        }),
        ...(roleTypeIds && {
          role_types: { some: { role_type_id: { in: roleTypeIds } } }
        }),
        ...(regionIds && {
          regions: { some: { region_id: { in: regionIds } } }
        }),
        ...((publicationIds || publicationMediatypes || publicationTiers) && {
          publications: { some: { publication_id: { in: publicationsWithMediatypesOrTiers?.map((p) => p.id) } } }
        })
      },
      orderBy
    });

    const journalists = await this.prismaMediamine?.journalist.updateMany({
      data: {
        enabled
      },
      where: {
        id: { in: journalistsExisting?.map((j) => j.id) }
      }
    });

    return {
      journalists
    };
  }
}
