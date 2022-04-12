import { Module } from "@nestjs/common";
import { XlsxReaderService } from "./xlsx-reader.service";
import { TxtReaderModule } from "src/txt-reader/txt-reader.module";
import { UtilsModule } from "src/utils/utils.module";

@Module({
  imports: [TxtReaderModule, UtilsModule],
  providers: [XlsxReaderService],
  exports: [XlsxReaderService],
})
export class XlsxReaderModule {}
