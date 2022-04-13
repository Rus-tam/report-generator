import { Module } from "@nestjs/common";
import { XlsxReaderService } from "./xlsx-reader.service";
import { UtilsModule } from "src/utils/utils.module";

@Module({
  imports: [UtilsModule],
  providers: [XlsxReaderService],
  exports: [XlsxReaderService],
})
export class XlsxReaderModule {}
