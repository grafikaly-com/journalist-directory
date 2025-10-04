import { Test, TestingModule } from '@nestjs/testing';
import { JournalistSearchController } from './journalist-search.controller';
import { JournalistSearchService } from './journalist-search.service';

describe('JournalistSearchController', () => {
  let controller: JournalistSearchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JournalistSearchController],
      providers: [JournalistSearchService]
    }).compile();

    controller = module.get<JournalistSearchController>(JournalistSearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
