import { Test, TestingModule } from '@nestjs/testing';
import { FormatTypeService } from './format-type.service';

describe('FormatTypeService', () => {
  let service: FormatTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormatTypeService]
    }).compile();

    service = module.get<FormatTypeService>(FormatTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
