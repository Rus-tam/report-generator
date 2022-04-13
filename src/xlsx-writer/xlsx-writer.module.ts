import { Module } from "@nestjs/common";
import { XlsxWriterService } from "./xlsx-writer.service";
import { UtilsModule } from "src/utils/utils.module";

@Module({
  imports: [UtilsModule],
  providers: [XlsxWriterService],
  exports: [XlsxWriterService],
})
export class XlsxWriterModule {}
