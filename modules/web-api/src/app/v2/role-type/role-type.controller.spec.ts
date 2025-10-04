import { Test, TestingModule } from '@nestjs/testing';
import { RoleTypeController } from './role-type.controller';
import { RoleTypeService } from './role-type.service';

describe('RoleTypeController', () => {
  let controller: RoleTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleTypeController],
      providers: [RoleTypeService]
    }).compile();

    controller = module.get<RoleTypeController>(RoleTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
