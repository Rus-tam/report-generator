import { Injectable } from "@nestjs/common";
import { TxtReaderService } from "src/txt-reader/txt-reader.service";
import { XlsxReaderService } from "src/xlsx-reader/xlsx-reader.service";
import * as xlsx from "xlsx";

@Injectable()
export class XlsxWriterService {
  constructor(
    private readonly txtReaderService: TxtReaderService,
    private readonly xlsxReaderService: XlsxReaderService,
  ) {}

  async createXlsxFile() {
    const {
      colNumb,
      trayEfficiencies,
      stateCond,
      physicalCond,
      pressureList,
      feedStages,
      drawStages,
      internalExternalStr,
    } = await this.txtReaderService.parseTXTFile();

    console.log(trayEfficiencies);

    // let workBook = xlsx.utils.book_new();
    // const workSheet = xlsx.utils.json_to_sheet();
    // xlsx.utils.book_append_sheet(workBook, workSheet, "response");
    // let exportFileName = "response.xlsx";
    // xlsx.writeFile(workBook, exportFileName);
  }
}
