import { Injectable, NotFoundException } from "@nestjs/common";
import { IJsonCreator } from "src/interfaces/jsonCreator.interface";
import { ITxtData } from "src/interfaces/txtData.interface";
import { IXlsxData } from "src/interfaces/xlsxData.interface";

@Injectable()
export class UtilsService {
  // Удаляет пустые элементы из массива
  deleteEmptyElements(line: string[]): string[] {
    const cleanLine: string[] = [];
    for (const elem of line) {
      if (elem.length !== 0) {
        cleanLine.push(elem);
      }
    }

    return cleanLine;
  }

  // Применяет метод split к элементам массива
  arrayElementSplit(arr: string[], separator: string): string[] {
    const splitedArr = [];
    const resultingArr = [];
    for (const elem of arr) {
      splitedArr.push(elem.split(separator));
    }

    for (const elem of splitedArr) {
      for (const item of elem) {
        resultingArr.push(item);
      }
    }
    return resultingArr;
  }

  // Выдает искомую область из файла internal.txt по ключевому слову. Работает для таблиц с данными
  defineWorkingRange(lines: string[], numberOfTrays: number, keyWord: string): string[] {
    let startPosition = 0;
    let workingRange: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(keyWord)) {
        startPosition = i + 3;
      }
    }
    for (let i = startPosition; i < startPosition + numberOfTrays; i++) {
      workingRange.push(lines[i]);
    }

    return workingRange;
  }

  // Определить ключи элементов в объекте
  objectKeyFinder(obj: {}) {
    const keys: string[] = [];
    try {
      for (let key in obj) {
        keys.push(key);
      }
    } catch (e) {
      throw new NotFoundException("Не удается найти ключи у объекта");
    }
    return keys;
  }

  // Объеденяет название потока и номер его тарелки
  streamStagePairMaker(stages: {}, streams: string[]): string[] {
    const streamStagePair: string[] = [];
    for (let stream of streams) {
      streamStagePair.push(`${stream} / ${stages[stream]}`);
    }
    return streamStagePair;
  }

  // Создаем json на основе данных из текстового документа
  mainJsonCreator(txtData: ITxtData, xlsxData: IXlsxData): IJsonCreator[] {
    const {
      colNumb,
      numberOfTrays,
      trayEfficiencies,
      stateCond,
      physicalCond,
      pressureList,
      feedStages,
      drawStages,
      internalExternalStr,
    } = txtData;
    const { liquidTemp, vapourTemp, liquidMassFlow, vapourMassFlow, liquidVolFlow, vapourVolFlow } = stateCond;
    const {
      liquidMolWeight,
      vapourMolWeight,
      liquidMassDensity,
      vapourMassDensity,
      liquidViscosity,
      vapourViscosity,
      surfaceTension,
    } = physicalCond;
    const excelData: IJsonCreator[] = [];

    const feedStreams = this.objectKeyFinder(xlsxData.feedProperties);
    const drawStreams = this.objectKeyFinder(xlsxData.drawProperties);

    const streamStagePairFeed = this.streamStagePairMaker(feedStages, this.objectKeyFinder(xlsxData.feedProperties));
    const streamStagePairDraw = this.streamStagePairMaker(drawStages, drawStreams);

    for (let i = 0; i < numberOfTrays * 2 + 3 + feedStreams.length + drawStreams.length + 10; i++) {
      if (i < numberOfTrays) {
        excelData.push({
          trayNumber: i + 1,
          trayEfficiencies: trayEfficiencies[i],
          liquidTemp: liquidTemp[i],
          liquidMassFlow: liquidMassFlow[i],
          liquidVolFlow: liquidVolFlow[i],
          liquidMassDensity: liquidMassDensity[i],
          liquidMolWeight: liquidMolWeight[i],
          liquidViscosity: liquidViscosity[i],
          surfaceTension: surfaceTension[i],
          additionalField1: null,
          additionalField2: null,
        });
      } else if (i === numberOfTrays + 1) {
        excelData.push({
          trayNumber: null,
          trayEfficiencies: null,
          liquidTemp: null,
          liquidMassFlow: null,
          liquidVolFlow: null,
          liquidMassDensity: null,
          liquidMolWeight: null,
          liquidViscosity: null,
          surfaceTension: null,
          additionalField1: null,
          additionalField2: null,
        });
      } else if (i === numberOfTrays + 2) {
        excelData.push({
          trayNumber: "trayNumber",
          trayEfficiencies: "trayEfficiencies",
          liquidTemp: "vapourTemp",
          liquidMassFlow: "vapourMassFlow",
          liquidVolFlow: "vapourVolFlow",
          liquidMassDensity: "vapourMassDensity",
          liquidMolWeight: "vapourMolWeight",
          liquidViscosity: "vapourViscosity",
          surfaceTension: null,
          additionalField1: null,
          additionalField2: null,
        });
      } else if (i > numberOfTrays + 2 && i < numberOfTrays * 2 + 3) {
        excelData.push({
          trayNumber: i - numberOfTrays - 2,
          trayEfficiencies: trayEfficiencies[i - numberOfTrays - 3],
          liquidTemp: vapourTemp[i - numberOfTrays - 3],
          liquidMassFlow: vapourMassFlow[i - numberOfTrays - 3],
          liquidVolFlow: vapourVolFlow[i - numberOfTrays - 3],
          liquidMassDensity: vapourMassDensity[i - numberOfTrays - 3],
          liquidMolWeight: vapourMolWeight[i - numberOfTrays - 3],
          liquidViscosity: vapourViscosity[i - numberOfTrays - 3],
          surfaceTension: null,
          additionalField1: null,
          additionalField2: null,
        });
      } else if (i === numberOfTrays * 2 + 3) {
        excelData.push({
          trayNumber: null,
          trayEfficiencies: null,
          liquidTemp: null,
          liquidMassFlow: null,
          liquidVolFlow: null,
          liquidMassDensity: null,
          liquidMolWeight: null,
          liquidViscosity: null,
          surfaceTension: null,
          additionalField1: null,
          additionalField2: null,
        });
      } else if (i === numberOfTrays * 2 + 4) {
        excelData.push({
          trayNumber: "Feed Stream / Inlet Stage",
          trayEfficiencies: "Vapour Fraction",
          liquidTemp: "Temperature [C]",
          liquidMassFlow: "Pressure [MPa]",
          liquidVolFlow: "Molar Flow [kgmole/h]",
          liquidMassDensity: "Mass Flow [kg/h]",
          liquidMolWeight: "Heat Flow [MW]",
          liquidViscosity: "Molecular Weight",
          surfaceTension: "Mass Density [kg/m3]",
          additionalField1: "Vapour Volume Flow [m3/h]",
          additionalField2: "Liquid Volume Flow [m3/h]",
        });
      } else if (i > numberOfTrays * 2 + 4 && i <= numberOfTrays * 2 + 4 + feedStreams.length) {
        let feedStream = feedStreams[i - (numberOfTrays * 2 + 5)];
        let feedStagePair = streamStagePairFeed[i - (numberOfTrays * 2 + 5)];
        let feedProperties = xlsxData.feedProperties[feedStream];
        excelData.push({
          trayNumber: feedStagePair,
          trayEfficiencies: feedProperties["Vapour Fraction"],
          liquidTemp: feedProperties["Temperature [C]"],
          liquidMassFlow: feedProperties["Pressure [MPa]"],
          liquidVolFlow: feedProperties["Molar Flow [kgmole/h]"],
          liquidMassDensity: feedProperties["Mass Flow [kg/h]"],
          liquidMolWeight: feedProperties["Heat Flow [MW]"],
          liquidViscosity: feedProperties["Molecular Weight"],
          surfaceTension: feedProperties["Mass Density [kg/m3]"],
          additionalField1: feedProperties["Vapour Volume Flow [m3/h]"],
          additionalField2: feedProperties["Liquid Volume Flow [m3/h]"],
        });
      } else if (i === numberOfTrays * 2 + 5 + feedStreams.length) {
        excelData.push({
          trayNumber: null,
          trayEfficiencies: null,
          liquidTemp: null,
          liquidMassFlow: null,
          liquidVolFlow: null,
          liquidMassDensity: null,
          liquidMolWeight: null,
          liquidViscosity: null,
          surfaceTension: null,
          additionalField1: null,
          additionalField2: null,
        });
      } else if (i === numberOfTrays * 2 + 6 + feedStreams.length) {
        excelData.push({
          trayNumber: "Draw Stream / Outlet Stage",
          trayEfficiencies: "Vapour Fraction",
          liquidTemp: "Temperature [C]",
          liquidMassFlow: "Pressure [MPa]",
          liquidVolFlow: "Molar Flow [kgmole/h]",
          liquidMassDensity: "Mass Flow [kg/h]",
          liquidMolWeight: "Heat Flow [MW]",
          liquidViscosity: "Molecular Weight",
          surfaceTension: "Mass Density [kg/m3]",
          additionalField1: "Vapour Volume Flow [m3/h]",
          additionalField2: "Liquid Volume Flow [m3/h]",
        });
      } else if (
        i > numberOfTrays * 2 + 6 + feedStreams.length &&
        i <= numberOfTrays * 2 + 6 + feedStreams.length + drawStreams.length
      ) {
        let drawStream = drawStreams[i - (numberOfTrays * 2 + 7 + feedStreams.length)];
        let drawStagePair = streamStagePairDraw[i - (numberOfTrays * 2 + 7 + feedStreams.length)];
        let drawProperties = xlsxData.drawProperties[drawStream];
        excelData.push({
          trayNumber: drawStagePair,
          trayEfficiencies: drawProperties["Vapour Fraction"],
          liquidTemp: drawProperties["Temperature [C]"],
          liquidMassFlow: drawProperties["Pressure [MPa]"],
          liquidVolFlow: drawProperties["Molar Flow [kgmole/h]"],
          liquidMassDensity: drawProperties["Mass Flow [kg/h]"],
          liquidMolWeight: drawProperties["Heat Flow [MW]"],
          liquidViscosity: drawProperties["Molecular Weight"],
          surfaceTension: drawProperties["Mass Density [kg/m3]"],
          additionalField1: drawProperties["Vapour Volume Flow [m3/h]"],
          additionalField2: drawProperties["Liquid Volume Flow [m3/h]"],
        });
      }
    }

    return excelData;
  }
}
