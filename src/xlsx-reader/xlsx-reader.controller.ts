import { Controller, Get } from "@nestjs/common";
import { XlsxReaderService } from "./xlsx-reader.service";

@Controller("xlsx-reader")
export class XlsxReaderController {
  constructor(private readonly xlsxReaderService: XlsxReaderService) {}

  @Get()
  async readXlsxFile() {
    await this.xlsxReaderService.parseXlsxFile();
  }
}
