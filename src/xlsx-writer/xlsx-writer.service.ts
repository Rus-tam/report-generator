import { BadRequestException, Injectable } from "@nestjs/common";
import { IColWidth } from "src/interfaces/column-width.interface";
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

  async createXlsxFile() {
    const colInfo: IColWidth[] = [];
    let rowInfo = [];
    let columnDataHeight = [];
    const txtData: ITxtData = await this.txtReaderService.parseTXTFile();
    const xlsxData: IXlsxData = await this.xlsxReaderService.parseXlsxFile();

    rowInfo = [
      {
        hidden: true,
      },
    ];

    for (let i = 0; i < 11; i++) {
      colInfo.push({ wch: 30 });
    }

    const mainExcelData = this.excelDataService.mainJsonCreator(txtData, xlsxData);

    const componentsExcelData = this.excelDataService.componentJsonCreator(xlsxData);

    const mainColumnExcelData = this.excelDataService.mainColumnData(txtData, xlsxData);

    try {
      let workBook = xlsx.utils.book_new();
      const mainWorkSheet = xlsx.utils.json_to_sheet(mainExcelData);
      const componentsWorkSheet = xlsx.utils.json_to_sheet(componentsExcelData);
      const mainColumnWorkSheet = xlsx.utils.json_to_sheet(mainColumnExcelData);
      mainWorkSheet["!cols"] = colInfo;
      mainWorkSheet["!rows"] = rowInfo;
      componentsWorkSheet["!cols"] = colInfo;
      componentsWorkSheet["!rows"] = [{ hidden: true }];
      mainColumnWorkSheet["!cols"] = colInfo;
      mainColumnWorkSheet["!rows"] = [{ hidden: true }];
      xlsx.utils.book_append_sheet(workBook, mainWorkSheet, "Для ВКУ");
      xlsx.utils.book_append_sheet(workBook, componentsWorkSheet, "Состав");
      xlsx.utils.book_append_sheet(workBook, mainColumnWorkSheet, "Отчет");
      xlsx.writeFile(workBook, "response.xlsx");
    } catch (e) {
      throw new BadRequestException("Закройте открытый файл Excel");
    }
  }
}
