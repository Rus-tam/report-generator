import { Module } from "@nestjs/common";
import { TxtReaderModule } from "./txt-reader/txt-reader.module";
import { UtilsModule } from "./utils/utils.module";
import { XlsxReaderModule } from "./xlsx-reader/xlsx-reader.module";
import { XlsxWriterModule } from "./xlsx-writer/xlsx-writer.module";
import { FilesUploadModule } from './files-upload/files-upload.module';

@Module({
  imports: [TxtReaderModule, UtilsModule, XlsxReaderModule, XlsxWriterModule, FilesUploadModule],
})
export class AppModule {}
