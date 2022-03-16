import { Injectable } from "@nestjs/common";
import { TxtReaderService } from "src/txt-reader/txt-reader.service";
import { UtilsService } from "src/utils/utils.service";
import * as xlsx from "xlsx";

interface ITxtData {
  colNumb: string;
  trayEfficiencies: string[];
  stateCond: {
    liquidTemp: number[];
    vapourTemp: number[];
    liquidMassFlow: number[];
    vapourMassFlow: number[];
    liquidVolFlow: number[];
    vapourVolFlow: number[];
  };
  physicalCond: {
    liquidMolWeight: number[];
    vapourMolWeight: number[];
    liquidMassDensity: number[];
    vapourMassDensity: number[];
    liquidViscosity: number[];
    vapourViscosity: number[];
    surfaceTension: number[];
  };
  pressureList: number[];
  feedStages: {};
  drawStages: {};
  internalExternalStr: {};
}

@Injectable()
export class XlsxReaderService {
  constructor(private readonly txtReaderService: TxtReaderService, private utilsService: UtilsService) {}
  async parseXlsxFile() {
    const txtData: ITxtData = await this.txtReaderService.parseTXTFile();
    const workbook = await xlsx.readFile("src/files/streams.xlsx");
    const compositions: {}[] = xlsx.utils.sheet_to_json(workbook.Sheets["Compositions"]);
    const materialStreams: {}[] = xlsx.utils.sheet_to_json(workbook.Sheets["Material Streams"]);

    const { feedCompositions, drawCompositions } = await this.streamCompositions(compositions, txtData);
  }

  private async streamCompositions(compositions: {}[], txtData: ITxtData) {
    const { feedStages, drawStages, ...rest } = txtData;
    const drawCompositions = this.utilsService.streamComposition(drawStages, compositions);
    const feedCompositions = this.utilsService.streamComposition(feedStages, compositions);

    return { feedCompositions, drawCompositions };
  }

  private async streamProperties(compositions: {}[]) {}
}
