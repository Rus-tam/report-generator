import { Module } from "@nestjs/common";
import { ExcelDataService } from "./excel-data.service";
import { MainUtilsService } from "./main-utils.service";

@Module({
  providers: [MainUtilsService, ExcelDataService],
  exports: [MainUtilsService, ExcelDataService],
})
export class UtilsModule {}
