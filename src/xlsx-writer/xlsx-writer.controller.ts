import { Body, Controller, Get, Post } from "@nestjs/common";
import { XlsxWriterService } from "./xlsx-writer.service";

@Controller("xlsx-writer")
export class XlsxWriterController {
  constructor(private readonly xlsxWriterService: XlsxWriterService) {}

  @Post()
  createExcelFile() {
    this.xlsxWriterService.createXlsxFile();
  }
}
