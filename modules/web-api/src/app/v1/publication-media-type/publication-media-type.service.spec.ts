import { Test, TestingModule } from '@nestjs/testing';
import { PublicationMediaTypeService } from './publication-media-type.service';

describe('PublicationMediaTypeService', () => {
  let service: PublicationMediaTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublicationMediaTypeService]
    }).compile();

    service = module.get<PublicationMediaTypeService>(PublicationMediaTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
