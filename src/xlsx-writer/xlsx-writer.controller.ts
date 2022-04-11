import { Body, Controller, Get, Post } from "@nestjs/common";
import { ITxtData } from "src/interfaces/txt-data.interface";
import { IXlsxData } from "src/interfaces/xlsx-data.interface";
import { TxtReaderService } from "src/txt-reader/txt-reader.service";
import { XlsxReaderService } from "src/xlsx-reader/xlsx-reader.service";
import { AddStreamDto } from "./dto/add-stream.dto";
import { XlsxWriterService } from "./xlsx-writer.service";

@Controller("xlsx-writer")
export class XlsxWriterController {
  constructor(
    private readonly xlsxWriterService: XlsxWriterService,
    private readonly xlsReaderService: XlsxReaderService,
    private readonly txtDataService: TxtReaderService,
  ) {}

  @Get()
  async getAllData(): Promise<{ txtData: ITxtData; excelData: IXlsxData }> {
    const excelData = await this.xlsReaderService.parseXlsxFile();
    const txtData = await this.txtDataService.parseTXTFile();

    return { txtData, excelData };
  }

  @Post()
  createExcelFile(@Body() additionalStreams: AddStreamDto) {
    this.xlsxWriterService.createXlsxFile(additionalStreams);
  }
}
