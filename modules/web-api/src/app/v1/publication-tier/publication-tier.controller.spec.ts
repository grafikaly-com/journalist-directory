import { Test, TestingModule } from '@nestjs/testing';
import { PublicationTierController } from './publication-tier.controller';
import { PublicationTierService } from './publication-tier.service';

describe('PublicationTierController', () => {
  let controller: PublicationTierController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicationTierController],
      providers: [PublicationTierService]
    }).compile();

    controller = module.get<PublicationTierController>(PublicationTierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
