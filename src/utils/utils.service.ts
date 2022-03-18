import { Injectable, NotFoundException } from "@nestjs/common";
import { IJsonCreator } from "src/interfaces/jsonCreator.interface";
import { ITxtData } from "src/interfaces/txtData.interface";

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

  // Создаем json на основе данных из текстового документа
  jsonCreator(txtData: ITxtData): IJsonCreator[] {
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

    for (let i = 0; i < numberOfTrays * 2 + 3; i++) {
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
        });
      } else if (i > numberOfTrays + 2) {
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
        });
      }
    }

    return excelData;
  }
}
