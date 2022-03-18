import { Test, TestingModule } from '@nestjs/testing';
import { XlsxWriterController } from './xlsx-writer.controller';

describe('XlsxWriterController', () => {
  let controller: XlsxWriterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [XlsxWriterController],
    }).compile();

    controller = module.get<XlsxWriterController>(XlsxWriterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
