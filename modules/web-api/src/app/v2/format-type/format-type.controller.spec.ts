import { Test, TestingModule } from '@nestjs/testing';
import { FormatTypeController } from './format-type.controller';
import { FormatTypeService } from './format-type.service';

describe('FormatTypeController', () => {
  let controller: FormatTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormatTypeController],
      providers: [FormatTypeService]
    }).compile();

    controller = module.get<FormatTypeController>(FormatTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
