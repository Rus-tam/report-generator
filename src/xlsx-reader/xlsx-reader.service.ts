import { Injectable } from "@nestjs/common";
import { TxtReaderService } from "src/txt-reader/txt-reader.service";
import { UtilsService } from "src/utils/utils.service";
import { ITxtData } from "src/interfaces/txtData.interface";
import * as xlsx from "xlsx";
import { IStreamComposition } from "src/interfaces/streamComposition.interface";
import { IStreamProperty } from "src/interfaces/streamProperty.interface";

@Injectable()
export class XlsxReaderService {
  constructor(private readonly txtReaderService: TxtReaderService, private utilsService: UtilsService) {}
  async parseXlsxFile() {
    const txtData: ITxtData = await this.txtReaderService.parseTXTFile();
    const workbook = await xlsx.readFile("src/files/streams.xlsx");
    const compositions: {}[] = xlsx.utils.sheet_to_json(workbook.Sheets["Compositions"]);
    const materialStreams: {}[] = xlsx.utils.sheet_to_json(workbook.Sheets["Material Streams"]);

    const { feedCompositions, drawCompositions } = this.streamCompositions(compositions, txtData);
    const { feedProperties, drawProperties } = this.streamProperties(materialStreams, txtData);
  }

  private streamCompositions(compositions: {}[], txtData: ITxtData): IStreamComposition {
    const { feedStages, drawStages, ...rest } = txtData;
    const drawCompositions = this.utilsService.streamComposition(drawStages, compositions);
    const feedCompositions = this.utilsService.streamComposition(feedStages, compositions);

    return { feedCompositions, drawCompositions };
  }

  private streamProperties(materialStreams: {}[], txtData: ITxtData): IStreamProperty {
    const { feedStages, drawStages, ...rest } = txtData;
    const feedProperties = this.utilsService.streamProperty(feedStages, materialStreams);
    const drawProperties = this.utilsService.streamProperty(drawStages, materialStreams);

    return { feedProperties, drawProperties };
  }
}
