import { Test, TestingModule } from '@nestjs/testing';
import { TxtReaderController } from './txt-reader.controller';

describe('TxtReaderController', () => {
  let controller: TxtReaderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TxtReaderController],
    }).compile();

    controller = module.get<TxtReaderController>(TxtReaderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
