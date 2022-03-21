import { Module } from "@nestjs/common";
import { ExcelDataService } from "./excelData.service";
import { MainUtilsService } from "./mainUtils.service";

@Module({
  providers: [MainUtilsService, ExcelDataService],
  exports: [MainUtilsService, ExcelDataService],
})
export class UtilsModule {}
