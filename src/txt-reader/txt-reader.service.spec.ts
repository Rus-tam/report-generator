import { Test, TestingModule } from '@nestjs/testing';
import { TxtReaderService } from './txt-reader.service';

describe('TxtReaderService', () => {
  let service: TxtReaderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TxtReaderService],
    }).compile();

    service = module.get<TxtReaderService>(TxtReaderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
