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
    const workbook = xlsx.readFile("src/files/streams.xlsx");
    const compositions: IStages[] = xlsx.utils.sheet_to_json(workbook.Sheets["Compositions"]);
    const materialStreams: IStages[] = xlsx.utils.sheet_to_json(workbook.Sheets["Material Streams"]);

    const { feedCompositions, drawCompositions } = this.streamCompositions(compositions, txtData);
    const { feedProperties, drawProperties } = this.streamProperties(materialStreams, txtData);
    const allStreams = this.getAllStreams(materialStreams);

    return { feedCompositions, drawCompositions, feedProperties, drawProperties };
  }

  // Извлечение составов из экселевского документа
  private streamCompositionExtractor(stages: IStages, compositions: {}[]): IStreamCompositionExtr {
    let streamComposition: IStreamCompositionExtr = {};
    const streams = this.mainUtilsService.objectKeyFinder(stages).filter((stream) => {
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
  private streamPropertiesExtractor(stages: IStages, properties: {}[]): IStreamPropertyObj {
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
    const streams = this.mainUtilsService.objectKeyFinder(stages);

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

  private streamCompositions(compositions: IStages[], txtData: ITxtData): IStreamComposition {
    const { feedStages, drawStages, ...rest } = txtData;
    const drawCompositions = this.streamCompositionExtractor(drawStages, compositions);
    const feedCompositions = this.streamCompositionExtractor(feedStages, compositions);

    return { feedCompositions, drawCompositions };
  }

  private streamProperties(materialStreams: IStages[], txtData: ITxtData): IStreamProperty {
    const { feedStages, drawStages, ...rest } = txtData;
    const feedProperties = this.streamPropertiesExtractor(feedStages, materialStreams);
    const drawProperties = this.streamPropertiesExtractor(drawStages, materialStreams);

    return { feedProperties, drawProperties };
  }

  private getAllStreams(materialStreams: IStages[]): string[] {
    let allStreams = Object.keys(materialStreams[0]);

    allStreams = allStreams.filter((stream) => stream !== "__EMPTY");
    allStreams = allStreams.filter((stream) => stream !== "\x1548=8FK");

    return allStreams;
  }
}
