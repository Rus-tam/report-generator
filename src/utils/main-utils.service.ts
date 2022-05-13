import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { IStreamProp } from "src/interfaces/stream-prop.interface";
import { IStages } from "src/interfaces/stages.interface";
import { IStreamPropertyObj } from "src/interfaces/streams-properties-obj.interface";
import { path } from "app-root-path";
import { ensureDir, readdir } from "fs-extra";
import { ICreatedAt } from "src/interfaces/createdAt.interface";
import { unlink } from "fs-extra";
import { UserName } from "src/decorators/user-name.decorator";

@Injectable()
export class MainUtilsService {
  // Удаляет пустые элементы из массива
  deleteEmptyElements(lines: string[]): string[] {
    let cleanLine: string[] = lines.filter((line) => line.length != 0);

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

  // Объеденяет название потока и номер его тарелки
  streamStagePairMaker(stages: {}, streams: string[]): string[] {
    const streamStagePair: string[] = [];
    for (let stream of streams) {
      if (stages[stream] !== undefined) {
        streamStagePair.push(`${stream} / ${stages[stream]}`);
      } else {
        streamStagePair.push(`${stream} / Дополнительный поток`);
      }
    }
    return streamStagePair;
  }

  // Округление до тысячных
  rounded(value: number, number: number) {
    try {
      return +value.toFixed(number);
    } catch (e) {
      throw new BadRequestException("Не удается округлить значение");
    }
  }

  // Округление данных в propData
  propDataRound(propData: IStreamProp): IStreamProp {
    return {
      "Vapour Fraction": this.rounded(propData["Vapour Fraction"], 3),
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

  flowRatesDefiner(tray: string, streamStages: IStages, properties: IStreamPropertyObj, colNumb: string) {
    for (let key in streamStages) {
      properties[key] === undefined ? (key = key + " " + `@${colNumb}`) : null;
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

  async initialFileName(fileExtention: string, userName: string): Promise<string> {
    await ensureDir(`${path}/files/${userName}`);
    const dirFiles: string[] = await readdir(`${path}/files/${userName}`);

    return dirFiles.find((file) => file.split(".").includes(fileExtention));
  }

  // Находим последний созданный файл
  latestCreated(createTime: ICreatedAt[], fileExtention: string): string {
    let maxTime = 0;
    let saveFile = "";
    for (let time of createTime) {
      if (time.fileName.split(".").pop() === fileExtention) {
        if (maxTime < time.createdAt) {
          maxTime = time.createdAt;
          saveFile = time.fileName;
        }
      }
    }

    return saveFile;
  }

  // Удаление старых файлов
  deleteOldFiles(dirFiles: string[], fileExtention: string, userName: string, saveFile: string) {
    for (let file of dirFiles) {
      if (file !== saveFile && file.split(".").pop() === fileExtention) {
        unlink(`${path}/files/${userName}/${file}`);
      }
    }
  }
}
