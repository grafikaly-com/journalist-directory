import { Test, TestingModule } from '@nestjs/testing';
import { JournalistSearchService } from './journalist-search.service';

describe('JournalistSearchService', () => {
  let service: JournalistSearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JournalistSearchService]
    }).compile();

    service = module.get<JournalistSearchService>(JournalistSearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
