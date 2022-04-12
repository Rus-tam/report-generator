import { Module } from "@nestjs/common";
import { UtilsModule } from "src/utils/utils.module";
import { TxtReaderService } from "./txt-reader.service";

@Module({
  imports: [UtilsModule],
  providers: [TxtReaderService],
  exports: [TxtReaderService],
})
export class TxtReaderModule {}
