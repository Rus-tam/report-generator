import { Injectable } from "@nestjs/common";
import { TxtReaderService } from "src/txt-reader/txt-reader.service";
import { UtilsService } from "src/utils/utils.service";
import * as xlsx from "xlsx";

@Injectable()
export class XlsxReaderService {
  constructor(private readonly txtReaderService: TxtReaderService, private utilsService: UtilsService) {}
  async parseXlsxFile() {
    const workbook = await xlsx.readFile("src/files/streams.xlsx");
    const compositions: {}[] = xlsx.utils.sheet_to_json(workbook.Sheets["Compositions"]);
    const materialStreams: {}[] = xlsx.utils.sheet_to_json(workbook.Sheets["Material Streams"]);

    const { feedCompositions, drawCompositions } = await this.streamCompositions(compositions);
  }

  private async streamCompositions(compositions: {}[]) {
    const { feedStages, drawStages, ...rest } = await this.txtReaderService.parseTXTFile();

    const drawCompositions = this.utilsService.streamComposition(drawStages, compositions);
    const feedCompositions = this.utilsService.streamComposition(feedStages, compositions);

    return { feedCompositions, drawCompositions };
  }
}
