import { Body, Controller, Get, Post } from "@nestjs/common";
import { IMainColumnInfo } from "src/interfaces/main-column-info.interface";
import { XlsxWriterService } from "./xlsx-writer.service";

@Controller("xlsx-writer")
export class XlsxWriterController {
  constructor(private readonly xlsxWriterService: XlsxWriterService) {}

  @Post()
  createExcelFile(@Body() columnInfo: IMainColumnInfo) {
    this.xlsxWriterService.createXlsxFile(columnInfo);
  }
}
