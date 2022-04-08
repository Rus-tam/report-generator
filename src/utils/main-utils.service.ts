import { Injectable, NotFoundException } from "@nestjs/common";
import { captureRejectionSymbol } from "events";
import { IJsonCreator } from "src/interfaces/json-creator.interface";
import { IStreamProp } from "src/interfaces/stream-prop.interface";
import { ITxtData } from "src/interfaces/txt-data.interface";
import { IXlsxData } from "src/interfaces/xlsx-data.interface";

@Injectable()
export class MainUtilsService {
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
    const resultingArr: string[] = [];
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
  objectKeyFinder(obj: {}): string[] {
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

  // Определяем значения объектов по ключам
  objectValueFinder(obj: {}): string[] {
    const values: string[] = [];
    try {
      for (let key in obj) {
        values.push(obj[key]);
      }
    } catch (e) {
      throw new NotFoundException("Не удается найти значение по ключу");
    }
    return values;
  }

  // Объеденяет название потока и номер его тарелки
  streamStagePairMaker(stages: {}, streams: string[]): string[] {
    const streamStagePair: string[] = [];
    for (let stream of streams) {
      streamStagePair.push(`${stream} / ${stages[stream]}`);
    }
    return streamStagePair;
  }

  // Округление до тысячных
  rounded(value: number, number: number) {
    return +value.toFixed(number);
  }

  // Округление данных в propData
  propDataRound(propData: IStreamProp): IStreamProp {
    return {
      "Temperature [C]": this.rounded(propData["Temperature [C]"], 3),
      "Pressure [MPa]": this.rounded(propData["Pressure [MPa]"], 3),
      "Molar Flow [kgmole/h]": this.rounded(propData["Molar Flow [kgmole/h]"], 3),
      "Mass Flow [kg/h]": this.rounded(propData["Mass Flow [kg/h]"], 3),
      "Heat Flow [MW]": this.rounded(propData["Heat Flow [MW]"], 3),
      "Molecular Weight": this.rounded(propData["Molecular Weight"], 3),
      "Mass Density [kg/m3]": this.rounded(propData["Mass Density [kg/m3]"], 3),
      "Vapour Volume Flow [m3/h]": this.rounded(propData["Vapour Volume Flow [m3/h]"], 3),
      "Liquid Volume Flow [m3/h]": this.rounded(propData["Liquid Volume Flow [m3/h]"], 3),
    };
  }

  flowRatesDefiner(tray: string, streamStages: {}, properties: {}): number {
    for (let key in streamStages) {
      if (streamStages[key] === tray) {
        return properties[key]["Mass Flow [kg/h]"];
      }
    }
  }

  trayEfficiensyRange(trayEfficiencies: string[]): string[] {
    let result: string[] = [trayEfficiencies[0]];
    for (let i = 0; i < trayEfficiencies.length; i++) {
      if (trayEfficiencies[i] !== result[result.length - 1]) {
        result.push(trayEfficiencies[i]);
      }
    }
    return result;
  }
}