import { BadRequestException, Body, Controller, Get, HttpCode, Injectable, Post } from "@nestjs/common";
import { ITxtData } from "./interfaces/txt-data.interface";
import { IXlsxData } from "./interfaces/xlsx-data.interface";
import { TxtReaderService } from "./txt-reader/txt-reader.service";
import { XlsxReaderService } from "./xlsx-reader/xlsx-reader.service";
import { AddStreamDto } from "./xlsx-writer/dto/add-stream.dto";
import { XlsxWriterService } from "./xlsx-writer/xlsx-writer.service";

@Controller()
export class AppController {
  constructor(
    private readonly xlsxWriterService: XlsxWriterService,
    private readonly xlsReaderService: XlsxReaderService,
    private readonly txtDataService: TxtReaderService,
  ) {}

  @Get()
  @HttpCode(200)
  async getAllData(): Promise<{ txtData: ITxtData; excelData: IXlsxData }> {
    try {
      let additionalStreams: AddStreamDto = {
        addFeedStreams: [],
        addDrawStreams: [],
      };
      const txtData = await this.txtDataService.parseTXTFile();
      const excelData = await this.xlsReaderService.parseXlsxFile(additionalStreams, txtData);

      return { txtData, excelData };
    } catch (e) {
      throw new BadRequestException("Не удалось выполнить запрос");
    }
  }

  @Post()
  @HttpCode(201)
  async createExcelFile(@Body() additionalStreams: AddStreamDto) {
    try {
      const txtData = await this.txtDataService.parseTXTFile();
      const excelData = await this.xlsReaderService.parseXlsxFile(additionalStreams, txtData);

      this.xlsxWriterService.createXlsxFile(txtData, excelData);
    } catch (e) {
      throw new BadRequestException("Не удалось выполнить запрос");
    }
  }
}
