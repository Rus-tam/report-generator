import { Module } from "@nestjs/common";
import { XlsxReaderService } from "./xlsx-reader.service";
import { XlsxReaderController } from "./xlsx-reader.controller";
import { TxtReaderModule } from "src/txt-reader/txt-reader.module";
import { UtilsModule } from "src/utils/utils.module";

@Module({
  imports: [TxtReaderModule, UtilsModule],
  providers: [XlsxReaderService],
  controllers: [XlsxReaderController],
})
export class XlsxReaderModule {}
