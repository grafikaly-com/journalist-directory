import { Test, TestingModule } from '@nestjs/testing';
import { RoleTypeService } from './role-type.service';

describe('RoleTypeService', () => {
  let service: RoleTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleTypeService]
    }).compile();

    service = module.get<RoleTypeService>(RoleTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
