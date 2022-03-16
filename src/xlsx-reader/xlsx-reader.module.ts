import { Module } from "@nestjs/common";
import { XlsxReaderService } from "./xlsx-reader.service";
import { XlsxReaderController } from "./xlsx-reader.controller";
import { TxtReaderModule } from "src/txt-reader/txt-reader.module";

@Module({
  imports: [TxtReaderModule],
  providers: [XlsxReaderService],
  controllers: [XlsxReaderController],
})
export class XlsxReaderModule {}
