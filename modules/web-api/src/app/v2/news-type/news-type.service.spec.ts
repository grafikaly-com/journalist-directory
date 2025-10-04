import { Test, TestingModule } from '@nestjs/testing';
import { NewsTypeService } from './news-type.service';

describe('NewsTypeService', () => {
  let service: NewsTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NewsTypeService]
    }).compile();

    service = module.get<NewsTypeService>(NewsTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
