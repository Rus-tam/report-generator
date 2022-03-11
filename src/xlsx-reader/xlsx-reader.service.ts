import { Injectable } from "@nestjs/common";
import * as xlsx from "xlsx";

@Injectable()
export class XlsxReaderService {
  async parseXlsxFile() {
    const workbook = await xlsx.readFile("src/files/streams.xlsx");
    const sheet_name_list = workbook.SheetNames;
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

    for (let item of data) {
      console.log(item["__EMPTY"]);
    }
  }
}
