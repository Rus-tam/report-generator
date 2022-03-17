import { Injectable, NotFoundException } from "@nestjs/common";

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

  // Извлечение составов из экселевского документа
  streamComposition(stages: {}, compositions: {}[]): {} {
    let molFraction = {};
    let streamComposition = {};
    const streams = this.objectKeyFinder(stages);
    for (let stream of streams) {
      for (let obj of compositions) {
        if (obj[stream] >= 0.000001) {
          molFraction[obj["__EMPTY"]] = obj[stream];
        } else {
          molFraction[obj["__EMPTY"]] = 0;
        }
      }
      streamComposition[stream] = molFraction;
    }

    return streamComposition;
  }

  // Извлечение свойств потоков из экселевского документа
  streamProperty(stages: {}, properties: {}[]): {} {
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
    const streams = this.objectKeyFinder(stages);

    // Из-за проблем с кодировкой заголовки строчей не прочитываются. Соответственно их нужно заменить
    for (let i = 0; i < contents.length; i++) {
      properties[i]["__EMPTY"] = contents[i];
    }

    for (let stream of streams) {
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
}
