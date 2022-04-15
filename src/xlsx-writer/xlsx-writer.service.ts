import { BadRequestException, Injectable } from "@nestjs/common";
import { IColWidth } from "src/interfaces/column-width.interface";
import { ITxtData } from "src/interfaces/txt-data.interface";
import { IXlsxData } from "src/interfaces/xlsx-data.interface";
import { ExcelDataService } from "src/utils/excel-data.service";
import { path } from "app-root-path";
import { ensureDir } from "fs-extra";
import * as xlsx from "xlsx";

@Injectable()
export class XlsxWriterService {
  constructor(private readonly excelDataService: ExcelDataService) {}

  async createXlsxFile(txtData: ITxtData, xlsxData: IXlsxData) {
    const colInfo: IColWidth[] = [];
    const colInfoLoads: IColWidth[] = [];

    let rowInfo = [
      {
        hidden: true,
      },
    ];

    for (let i = 0; i < 25; i++) {
      colInfo.push({ wch: 30 });
      colInfoLoads.push({ wch: 22 });
    }

    const mainExcelData = this.excelDataService.mainJsonCreator(txtData, xlsxData);

    const componentsExcelData = this.excelDataService.componentJsonCreator(xlsxData);

    const mainColumnExcelData = this.excelDataService.mainColumnJsonCreater(txtData, xlsxData);

    const vapourLiquidLoad = this.excelDataService.vapourLiquidJsonCreator(txtData);

    try {
      let workBook = xlsx.utils.book_new();
      const mainWorkSheet = xlsx.utils.json_to_sheet(mainExcelData);
      const componentsWorkSheet = xlsx.utils.json_to_sheet(componentsExcelData);
      const mainColumnWorkSheet = xlsx.utils.json_to_sheet(mainColumnExcelData);
      const vapourLiquidLoadSheet = xlsx.utils.json_to_sheet(vapourLiquidLoad);
      mainWorkSheet["!cols"] = colInfo;
      mainWorkSheet["!rows"] = rowInfo;
      componentsWorkSheet["!cols"] = colInfo;
      componentsWorkSheet["!rows"] = [{ hidden: true }];
      mainColumnWorkSheet["!cols"] = colInfo;
      mainColumnWorkSheet["!rows"] = [{ hidden: true }];
      vapourLiquidLoadSheet["!cols"] = colInfoLoads;
      vapourLiquidLoadSheet["!rows"] = [{ hidden: true }];
      xlsx.utils.book_append_sheet(workBook, mainWorkSheet, "Для ВКУ");
      xlsx.utils.book_append_sheet(workBook, componentsWorkSheet, "Состав");
      xlsx.utils.book_append_sheet(workBook, mainColumnWorkSheet, "Отчет");
      xlsx.utils.book_append_sheet(workBook, vapourLiquidLoadSheet, "Нагрузки");

      const responseDir = `${path}/result/`;
      await ensureDir(responseDir);
      await xlsx.writeFile(workBook, `${responseDir}/column_info.xlsx`);
    } catch (e) {
      throw new BadRequestException("Закройте открытый файл Excel");
    }
  }
}
