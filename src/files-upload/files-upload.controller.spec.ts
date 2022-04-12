import { Test, TestingModule } from '@nestjs/testing';
import { FilesUploadController } from './files-upload.controller';

describe('FilesUploadController', () => {
  let controller: FilesUploadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesUploadController],
    }).compile();

    controller = module.get<FilesUploadController>(FilesUploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
