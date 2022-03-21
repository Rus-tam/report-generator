import { Injectable, NotFoundException } from "@nestjs/common";
import { IJsonCreator } from "src/interfaces/jsonCreator.interface";
import { IStreamProp } from "src/interfaces/streamProp.interface";
import { ITxtData } from "src/interfaces/txtData.interface";
import { IXlsxData } from "src/interfaces/xlsxData.interface";

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

  // Округление до тысячных
  rounded(num: number) {
    return +num.toFixed(3);
  }

  // Округление данных в propData
  propDataRound(propData: IStreamProp) {
    return {
      "Temperature [C]": this.rounded(propData["Temperature [C]"]),
      "Pressure [MPa]": this.rounded(propData["Pressure [MPa]"]),
      "Molar Flow [kgmole/h]": this.rounded(propData["Molar Flow [kgmole/h]"]),
      "Mass Flow [kg/h]": this.rounded(propData["Mass Flow [kg/h]"]),
      "Heat Flow [MW]": this.rounded(propData["Heat Flow [MW]"]),
      "Molecular Weight": this.rounded(propData["Molecular Weight"]),
      "Mass Density [kg/m3]": this.rounded(propData["Mass Density [kg/m3]"]),
      "Vapour Volume Flow [m3/h]": this.rounded(propData["Vapour Volume Flow [m3/h]"]),
      "Liquid Volume Flow [m3/h]": this.rounded(propData["Liquid Volume Flow [m3/h]"]),
    };
  }
}
