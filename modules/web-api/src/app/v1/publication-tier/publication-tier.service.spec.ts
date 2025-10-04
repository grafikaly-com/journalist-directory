import { Test, TestingModule } from '@nestjs/testing';
import { PublicationTierService } from './publication-tier.service';

describe('PublicationTierService', () => {
  let service: PublicationTierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublicationTierService]
    }).compile();

    service = module.get<PublicationTierService>(PublicationTierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
