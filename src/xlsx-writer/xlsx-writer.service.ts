import { BadRequestException, Injectable } from "@nestjs/common";
import { IColWidth } from "src/interfaces/column-width.interface";
import { IMainColumnInfo } from "src/interfaces/main-column-info.interface";
import { ITxtData } from "src/interfaces/txt-data.interface";
import { IXlsxData } from "src/interfaces/xlsx-data.interface";
import { TxtReaderService } from "src/txt-reader/txt-reader.service";
import { ExcelDataService } from "src/utils/excel-data.service";
import { MainUtilsService } from "src/utils/main-utils.service";
import { XlsxReaderService } from "src/xlsx-reader/xlsx-reader.service";
import * as xlsx from "xlsx";

@Injectable()
export class XlsxWriterService {
  constructor(
    private readonly txtReaderService: TxtReaderService,
    private readonly xlsxReaderService: XlsxReaderService,
    private readonly utilsService: MainUtilsService,
    private readonly excelDataService: ExcelDataService,
  ) {}

  async createXlsxFile(mainData: IMainColumnInfo) {
    const colInfo: IColWidth[] = [];
    let rowInfo = [];
    const txtData: ITxtData = await this.txtReaderService.parseTXTFile();
    const xlsxData: IXlsxData = await this.xlsxReaderService.parseXlsxFile();

    for (let i = 0; i < 11; i++) {
      colInfo.push({ wch: 30 });
    }

    rowInfo = [
      {
        hidden: true,
      },
    ];

    const mainExcelData = this.excelDataService.mainJsonCreator(txtData, xlsxData);

    const componentsExcelData = this.excelDataService.componentJsonCreator(xlsxData);

    const mainColumnExcelData = this.excelDataService.mainColumnData(txtData, xlsxData, mainData);

    try {
      let workBook = xlsx.utils.book_new();
      const mainWorkSheet = xlsx.utils.json_to_sheet(mainExcelData);
      const componentsWorkSheet = xlsx.utils.json_to_sheet(componentsExcelData);
      mainWorkSheet["!cols"] = colInfo;
      mainWorkSheet["!rows"] = rowInfo;
      componentsWorkSheet["!cols"] = colInfo;
      componentsWorkSheet["!rows"] = [{ hidden: true }];
      xlsx.utils.book_append_sheet(workBook, mainWorkSheet, "Main Data");
      xlsx.utils.book_append_sheet(workBook, componentsWorkSheet, "Components");
      xlsx.writeFile(workBook, "response.xlsx");
    } catch (e) {
      throw new BadRequestException("Закройте открытый файл Excel");
    }
  }
}
