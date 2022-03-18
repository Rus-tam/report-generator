import { Injectable } from "@nestjs/common";
import { TxtReaderService } from "src/txt-reader/txt-reader.service";
import { UtilsService } from "src/utils/utils.service";
import { ITxtData } from "src/interfaces/txtData.interface";
import * as xlsx from "xlsx";
import { IStreamComposition } from "src/interfaces/streamComposition.interface";
import { IStreamProperty } from "src/interfaces/streamProperty.interface";
import { IXlsxData } from "src/interfaces/xlsxData.interface";

@Injectable()
export class XlsxReaderService {
  constructor(private readonly txtReaderService: TxtReaderService, private utilsService: UtilsService) {}
  async parseXlsxFile(): Promise<IXlsxData> {
    const txtData: ITxtData = await this.txtReaderService.parseTXTFile();
    const workbook = await xlsx.readFile("src/files/streams.xlsx");
    const compositions: {}[] = xlsx.utils.sheet_to_json(workbook.Sheets["Compositions"]);
    const materialStreams: {}[] = xlsx.utils.sheet_to_json(workbook.Sheets["Material Streams"]);

    const { feedCompositions, drawCompositions } = this.streamCompositions(compositions, txtData);
    const { feedProperties, drawProperties } = this.streamProperties(materialStreams, txtData);

    return { feedCompositions, drawCompositions, feedProperties, drawProperties };
  }

  // Извлечение составов из экселевского документа
  private streamCompositionExtractor(stages: {}, compositions: {}[]): {} {
    let molFraction = {};
    let streamComposition = {};
    const streams = this.utilsService.objectKeyFinder(stages).filter((stream) => {
      if (
        !stream.includes("Reboiler") &&
        !stream.includes("Condenser") &&
        !stream.includes("Boilup") &&
        !stream.includes("Reflux")
      ) {
        return stream;
      }
    });

    for (let stream of streams) {
      molFraction = {};
      for (let obj of compositions) {
        if (obj[stream] >= 0.000001) {
          molFraction[obj["__EMPTY"]] = obj[stream];
        } else if (obj[stream] === undefined) {
          null;
        } else {
          molFraction[obj["__EMPTY"]] = 0;
        }
      }
      streamComposition[stream] = molFraction;
    }

    return streamComposition;
  }

  // Извлечение свойств потоков из экселевского документа
  private streamPropertiesExtractor(stages: {}, properties: {}[]): {} {
    const contents = [
      "Vapour Fraction",
      "Temperature [C]",
      "Pressure [MPa]",
      "Molar Flow [kgmole/h]",
      "Mass Flow [kg/h]",
      "Heat Flow [MW]",
      "Molecular Weight",
      "Mass Density [kg/m3]",
      "Vapour Volume Flow [m3/h]",
      "Liquid Volume Flow [m3/h]",
    ];
    let propData = {};
    let streamProperties = {};
    const streams = this.utilsService.objectKeyFinder(stages);

    // Из-за проблем с кодировкой заголовки строчей не прочитываются. Соответственно их нужно заменить
    for (let i = 0; i < contents.length; i++) {
      properties[i]["__EMPTY"] = contents[i];
    }

    for (let stream of streams) {
      propData = {};
      for (let obj of properties) {
        if (obj["__EMPTY"] === contents[9] && obj[stream] !== "<empty>") {
          propData[contents[9]] = obj[stream] * 3600;
        } else if (obj["__EMPTY"] === contents[9] && obj[stream] === "<empty>") {
          propData[contents[9]] = 0;
        } else if (obj["__EMPTY"] !== contents[9] && obj[stream] !== "<empty>") {
          propData[obj["__EMPTY"]] = obj[stream];
        } else if (obj["__EMPTY"] !== contents[9] && obj[stream] === "<empty>") {
          propData[obj["__EMPTY"]] = 0;
        }
      }
      streamProperties[stream] = propData;
    }
    return streamProperties;
  }

  private streamCompositions(compositions: {}[], txtData: ITxtData): IStreamComposition {
    const { feedStages, drawStages, ...rest } = txtData;
    const drawCompositions = this.streamCompositionExtractor(drawStages, compositions);
    const feedCompositions = this.streamCompositionExtractor(feedStages, compositions);

    return { feedCompositions, drawCompositions };
  }

  private streamProperties(materialStreams: {}[], txtData: ITxtData): IStreamProperty {
    const { feedStages, drawStages, ...rest } = txtData;
    const feedProperties = this.streamPropertiesExtractor(feedStages, materialStreams);
    const drawProperties = this.streamPropertiesExtractor(drawStages, materialStreams);

    return { feedProperties, drawProperties };
  }
}
