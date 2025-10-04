import { Test, TestingModule } from '@nestjs/testing';
import { ZerobounceService } from './zerobounce.service';

describe('ZerobounceService', () => {
  let service: ZerobounceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZerobounceService]
    }).compile();

    service = module.get<ZerobounceService>(ZerobounceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
