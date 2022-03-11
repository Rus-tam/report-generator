import { Module } from "@nestjs/common";
import { UtilsModule } from "src/utils/utils.module";
import { TxtReaderController } from "./txt-reader.controller";
import { TxtReaderService } from "./txt-reader.service";

@Module({
  imports: [UtilsModule],
  controllers: [TxtReaderController],
  providers: [TxtReaderService],
  exports: [TxtReaderService],
})
export class TxtReaderModule {}
