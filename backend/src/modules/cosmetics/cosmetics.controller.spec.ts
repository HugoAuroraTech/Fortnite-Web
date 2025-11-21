import { Test, TestingModule } from '@nestjs/testing';
import { CosmeticsController } from './cosmetics.controller';

describe('CosmeticsController', () => {
  let controller: CosmeticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CosmeticsController],
    }).compile();

    controller = module.get<CosmeticsController>(CosmeticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
