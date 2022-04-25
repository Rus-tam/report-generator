import { Injectable } from "@nestjs/common";
import { MainUtilsService } from "src/utils/main-utils.service";
import { ITxtData } from "src/interfaces/txt-data.interface";
import * as xlsx from "xlsx";
import { path } from "app-root-path";
import { IXlsxData } from "src/interfaces/xlsx-data.interface";
import { IStreamProp } from "src/interfaces/stream-prop.interface";
import { IStreamPropertyObj } from "src/interfaces/streams-properties-obj.interface";
import { IStreamCompositionExtr, IStreamMolFraction } from "src/interfaces/stream-compositions-extraction.interface";
import { IStages } from "src/interfaces/stages.interface";
import { AddStreamDto } from "src/xlsx-writer/dto/add-stream.dto";

@Injectable()
export class XlsxReaderService {
  constructor(private mainUtilsService: MainUtilsService) {}

  async parseXlsxFile(additionalStreams: AddStreamDto, txtData: ITxtData, userName: string): Promise<IXlsxData> {
    const { feedStages, drawStages, colNumb, ...rest } = txtData;

    const addFeedStreams = additionalStreams.addFeedStreams.filter((stream) => stream.length !== 0);
    const addDrawStreams = additionalStreams.addDrawStreams.filter((stream) => stream.length !== 0);

    let feedStreams = [...Object.keys(feedStages), ...addFeedStreams];
    let drawStreams = [...Object.keys(drawStages), ...addDrawStreams];

    const fileName = await this.mainUtilsService.initialFileName("xlsx", userName);

    const workbook = xlsx.readFile(`${path}/files/${userName}/${fileName}`);
    const compositions: IStages[] = xlsx.utils.sheet_to_json(workbook.Sheets["Compositions"]);
    const materialStreams: IStages[] = xlsx.utils.sheet_to_json(workbook.Sheets["Material Streams"]);

    // Streams composition
    const feedCompositions = this.streamComposition(feedStreams, colNumb, compositions);
    const drawCompositions = this.streamComposition(drawStreams, colNumb, compositions);

    // Stream properties
    const feedProperties = this.streamProperties(feedStreams, colNumb, materialStreams);
    const drawProperties = this.streamProperties(drawStreams, colNumb, materialStreams);

    // All streams names
    const allStreams = this.getAllStreams(materialStreams);

    return { feedCompositions, drawCompositions, feedProperties, drawProperties, allStreams };
  }

  // Извлечение составов из экселевского документа
  private streamComposition(streams: string[], colNumb: string, compositions: {}[]): IStreamCompositionExtr {
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
        obj[stream] === undefined ? (stream = stream + " " + `@${colNumb}`) : null;
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
  private streamProperties(streams: string[], colNumb: string, properties: {}[]): IStreamPropertyObj {
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
        obj[stream] === undefined ? (stream = stream + " " + `@${colNumb}`) : null;

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

  private getAllStreams(materialStreams: IStages[]): string[] {
    let allStreams = Object.keys(materialStreams[0]);

    allStreams = allStreams.filter((stream) => stream !== "__EMPTY");
    allStreams = allStreams.filter((stream) => stream !== "\x1548=8FK");

    return allStreams;
  }
}
