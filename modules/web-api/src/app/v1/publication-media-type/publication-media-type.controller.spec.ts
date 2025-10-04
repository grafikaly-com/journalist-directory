import { Test, TestingModule } from '@nestjs/testing';
import { PublicationMediaTypeController } from './publication-media-type.controller';
import { PublicationMediaTypeService } from './publication-media-type.service';

describe('PublicationMediaTypeController', () => {
  let controller: PublicationMediaTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicationMediaTypeController],
      providers: [PublicationMediaTypeService]
    }).compile();

    controller = module.get<PublicationMediaTypeController>(PublicationMediaTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
