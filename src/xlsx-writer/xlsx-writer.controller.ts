import { Controller, Get } from "@nestjs/common";
import { XlsxWriterService } from "./xlsx-writer.service";

@Controller("xlsx-writer")
export class XlsxWriterController {
  constructor(private readonly xlsxWriterService: XlsxWriterService) {}

  @Get()
  createExcelFile() {
    this.xlsxWriterService.createXlsxFile();
  }
}
