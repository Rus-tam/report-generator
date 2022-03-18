import { Test, TestingModule } from '@nestjs/testing';
import { XlsxWriterService } from './xlsx-writer.service';

describe('XlsxWriterService', () => {
  let service: XlsxWriterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [XlsxWriterService],
    }).compile();

    service = module.get<XlsxWriterService>(XlsxWriterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
