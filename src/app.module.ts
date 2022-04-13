import { Module } from "@nestjs/common";
import { TxtReaderModule } from "./txt-reader/txt-reader.module";
import { UtilsModule } from "./utils/utils.module";
import { XlsxReaderModule } from "./xlsx-reader/xlsx-reader.module";
import { XlsxWriterModule } from "./xlsx-writer/xlsx-writer.module";
import { FilesUploadModule } from "./files-upload/files-upload.module";
import { AppService } from "./app.service";
import { AppController } from "./app.controller";

@Module({
  imports: [TxtReaderModule, UtilsModule, XlsxReaderModule, XlsxWriterModule, FilesUploadModule],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
