import { Injectable } from "@nestjs/common";
import { TxtReaderService } from "src/txt-reader/txt-reader.service";
import { MainUtilsService } from "src/utils/main-utils.service";
import { ITxtData } from "src/interfaces/txt-data.interface";
import * as xlsx from "xlsx";
import { IStreamComposition } from "src/interfaces/stream-composition.interface";
import { IStreamProperty } from "src/interfaces/stream-property.interface";
import { IXlsxData } from "src/interfaces/xlsx-data.interface";
import { IStreamProp } from "src/interfaces/stream-prop.interface";
import { IStreamPropertyObj } from "src/interfaces/streams-properties-obj.interface";
import { IStreamCompositionExtr, IStreamMolFraction } from "src/interfaces/stream-compositions-extraction.interface";
import { IStages } from "src/interfaces/stages.interface";

@Injectable()
export class XlsxReaderService {
  constructor(private readonly txtReaderService: TxtReaderService, private mainUtilsService: MainUtilsService) {}

  async parseXlsxFile(): Promise<IXlsxData> {
    const txtData: ITxtData = await this.txtReaderService.parseTXTFile();
    const { feedStages, drawStages, ...rest } = txtData;
    let feedStreams = Object.keys(feedStages);
    let drawStreams = Object.keys(drawStages);

    const workbook = xlsx.readFile("src/files/streams.xlsx");
    const compositions: IStages[] = xlsx.utils.sheet_to_json(workbook.Sheets["Compositions"]);
    const materialStreams: IStages[] = xlsx.utils.sheet_to_json(workbook.Sheets["Material Streams"]);

    const { feedCompositions, drawCompositions } = this.streamCompositions(compositions, feedStreams, drawStreams);
    const { feedProperties, drawProperties } = this.streamProperties(materialStreams, feedStreams, drawStreams);
    const allStreams = this.getAllStreams(materialStreams);

    return { feedCompositions, drawCompositions, feedProperties, drawProperties, allStreams };
  }

  // Извлечение составов из экселевского документа
  private streamCompositionExtractor(streams: string[], compositions: {}[]): IStreamCompositionExtr {
    let streamComposition: IStreamCompositionExtr = {};
    streams = streams.filter((stream) => {
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
      let molFraction: IStreamMolFraction = {};
      for (let obj of compositions) {
        if (obj[stream] >= 0.000001) {
          molFraction[obj["__EMPTY"]] = this.mainUtilsService.rounded(obj[stream], 4);
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
  private streamPropertiesExtractor(streams: string[], properties: {}[]): IStreamPropertyObj {
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
    let streamProperties: IStreamPropertyObj = {};

    // Из-за проблем с кодировкой заголовки строчек не прочитываются. Соответственно их нужно заменить
    for (let i = 0; i < contents.length; i++) {
      properties[i]["__EMPTY"] = contents[i];
    }

    for (let stream of streams) {
      let propData: IStreamProp = {
        "Vapour Fraction": 0,
        "Temperature [C]": 0,
        "Pressure [MPa]": 0,
        "Molar Flow [kgmole/h]": 0,
        "Mass Flow [kg/h]": 0,
        "Heat Flow [MW]": 0,
        "Molecular Weight": 0,
        "Mass Density [kg/m3]": 0,
        "Vapour Volume Flow [m3/h]": 0,
        "Liquid Volume Flow [m3/h]": 0,
      };
      // Какая-то странная магия
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
      streamProperties[stream] = this.mainUtilsService.propDataRound(propData);
    }

    return streamProperties;
  }

  private streamCompositions(
    compositions: IStages[],
    feedStreams: string[],
    drawStreams: string[],
  ): IStreamComposition {
    const drawCompositions = this.streamCompositionExtractor(drawStreams, compositions);
    const feedCompositions = this.streamCompositionExtractor(feedStreams, compositions);

    return { feedCompositions, drawCompositions };
  }

  private streamProperties(materialStreams: IStages[], feedStreams: string[], drawStreams: string[]): IStreamProperty {
    const feedProperties = this.streamPropertiesExtractor(feedStreams, materialStreams);
    const drawProperties = this.streamPropertiesExtractor(drawStreams, materialStreams);

    return { feedProperties, drawProperties };
  }

  private getAllStreams(materialStreams: IStages[]): string[] {
    let allStreams = Object.keys(materialStreams[0]);

    allStreams = allStreams.filter((stream) => stream !== "__EMPTY");
    allStreams = allStreams.filter((stream) => stream !== "\x1548=8FK");

    return allStreams;
  }
}
