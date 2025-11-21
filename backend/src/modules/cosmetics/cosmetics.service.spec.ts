import { Test, TestingModule } from '@nestjs/testing';
import { CosmeticsService } from './cosmetics.service';

describe('CosmeticsService', () => {
  let service: CosmeticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CosmeticsService],
    }).compile();

    service = module.get<CosmeticsService>(CosmeticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
