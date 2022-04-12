import { Module } from "@nestjs/common";
import { TxtReaderModule } from "./txt-reader/txt-reader.module";
import { UtilsModule } from "./utils/utils.module";
import { XlsxReaderModule } from "./xlsx-reader/xlsx-reader.module";
import { XlsxWriterModule } from "./xlsx-writer/xlsx-writer.module";

@Module({
  imports: [TxtReaderModule, UtilsModule, XlsxReaderModule, XlsxWriterModule],
})
export class AppModule {}
