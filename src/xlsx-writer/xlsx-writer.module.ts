import { Module } from "@nestjs/common";
import { XlsxWriterService } from "./xlsx-writer.service";
import { XlsxWriterController } from "./xlsx-writer.controller";
import { UtilsModule } from "src/utils/utils.module";
import { XlsxReaderModule } from "src/xlsx-reader/xlsx-reader.module";
import { TxtReaderModule } from "src/txt-reader/txt-reader.module";

@Module({
  imports: [TxtReaderModule, UtilsModule, XlsxReaderModule],
  providers: [XlsxWriterService],
  controllers: [XlsxWriterController],
})
export class XlsxWriterModule {}
