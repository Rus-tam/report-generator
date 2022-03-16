import { Injectable } from "@nestjs/common";
import { TxtReaderService } from "src/txt-reader/txt-reader.service";
import * as xlsx from "xlsx";

@Injectable()
export class XlsxReaderService {
  constructor(private readonly txtReaderService: TxtReaderService) {}
  async parseXlsxFile() {
    const workbook = await xlsx.readFile("src/files/streams.xlsx");
    const compositions = xlsx.utils.sheet_to_json(workbook.Sheets["Compositions"]);
    const materialStreams = xlsx.utils.sheet_to_json(workbook.Sheets["Material Streams"]);

    await this.streamCompositions();
  }

  private async streamCompositions() {
    const { feedStages, drawStages, ...rest } = await this.txtReaderService.parseTXTFile();

    console.log(feedStages);
    console.log(drawStages);
  }
}
