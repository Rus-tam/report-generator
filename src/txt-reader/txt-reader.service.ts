import { Injectable } from "@nestjs/common";
import * as fs from "fs/promises";
import { UtilsService } from "../utils/utils.service";

@Injectable()
export class TxtReaderService {
  constructor(private readonly utilsService: UtilsService) {}

  async parseTXTFile() {
    let isReboiler = false;
    let isCondenser = false;
    let startPosition = 0;
    let endPosition = 0;
    const workingRangeTrayEff: string[] = [];
    const workingRangePress: string[] = [];
    const workingRangeInternalExternal: string[] = [];

    const data: string = await fs.readFile("src/files/internals.txt", "utf8");
    const lines = data.split("\n");

    lines.forEach((line) => {
      line.includes("Condenser") ? (isCondenser = true) : null;
      line.includes("Reboiler") ? (isReboiler = true) : null;
    });

    const numberOfTrays = this.trayNumber(lines);

    // Определяем рабочие участки текста
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("КПД ступеней")) {
        startPosition = i;
        isCondenser ? (startPosition = startPosition + 3) : (startPosition = startPosition + 2);
        endPosition = startPosition + numberOfTrays - 1;

        for (let i = startPosition; i < endPosition; i++) {
          workingRangeTrayEff.push(lines[i]);
        }
      }

      if (lines[i].includes("Профиль давления")) {
        isCondenser ? (startPosition = i + 4) : (startPosition = i + 2);
        for (let u = startPosition; u < startPosition + numberOfTrays + 1; u++) {
          workingRangePress.push(lines[u]);
        }
      }

      if (lines[i].includes("P-H испарения")) {
        workingRangeInternalExternal.push(lines[i]);
      }
    }

    const trayEffincies = this.trayEfficiencies(workingRangeTrayEff);
    const stateCond = this.stateConditions(lines, numberOfTrays);
    const physicalCond = this.physicalConditions(lines, numberOfTrays);
    const pressureList = this.pressureData(workingRangePress);
    const { feedStages, drawStages } = this.feedProductStreams(lines, numberOfTrays, isCondenser, isReboiler);
    const internalExternalStr = this.internalExternalStreams(workingRangeInternalExternal);

    return {
      trayEffincies,
      stateCond,
      physicalCond,
      pressureList,
      feedStages,
      drawStages,
      internalExternalStr,
    };
  }

  private trayNumber(lines: string[]): number {
    let linesFirstIter: string[] = [];
    let splitedArr: string[] = [];
    const startEndTrays: number[] = [];

    lines.forEach((line) => {
      if (line.includes("CS-1") && line.includes("1__Main Tower")) {
        linesFirstIter = this.utilsService.deleteEmptyElements(line.split(" "));
        splitedArr = this.utilsService.arrayElementSplit(linesFirstIter, "__");
      }
    });

    for (let i = 0; i < splitedArr.length; i++) {
      try {
        if (splitedArr[i] === "Main") {
          startEndTrays.push(parseInt(splitedArr[i - 1]));
        }
      } catch (e) {
        return null;
      }
    }

    return Math.max.apply(Math, startEndTrays);
  }

  // Нужно рефакторить
  private trayEfficiencies(workingRange: string[]): string[] {
    let trayEfficiencies: string[] = [];

    const splitedLines = this.utilsService.arrayElementSplit(workingRange, " ");
    const filteredLines = this.utilsService.deleteEmptyElements(splitedLines);

    trayEfficiencies.push(filteredLines[0]);
    for (let i = 0; i < filteredLines.length; i++) {
      try {
        if (filteredLines[i] === "\r") {
          trayEfficiencies.push(filteredLines[i + 1]);
        }
      } catch (e) {
        return null;
      }
    }

    return trayEfficiencies;
  }

  private stateConditions(lines: string[], numberOfTrays: number) {
    const liquidTemp: number[] = [];
    const vapourTemp: number[] = [];
    const liquidMassFlow: number[] = [];
    const vapourMassFlow: number[] = [];
    const liquidVolFlow: number[] = [];
    const vapourVolFlow: number[] = [];
    const workingRange = this.utilsService.defineWorkingRange(lines, numberOfTrays, "Режим работы");

    const splitedLines = this.utilsService.arrayElementSplit(workingRange, " ");
    const filteredLines = this.utilsService.deleteEmptyElements(splitedLines);

    for (let i = 0; i < filteredLines.length; i++) {
      if (filteredLines[i] === "Tower") {
        liquidTemp.push(parseFloat(filteredLines[i + 1]));
        vapourTemp.push(parseFloat(filteredLines[i + 2]));
        liquidMassFlow.push(parseFloat(filteredLines[i + 3]));
        vapourMassFlow.push(parseFloat(filteredLines[i + 4]));
        liquidVolFlow.push(parseFloat(filteredLines[i + 5]));
        vapourVolFlow.push(parseFloat(filteredLines[i + 6]));
      }
    }

    return {
      liquidTemp,
      vapourTemp,
      liquidMassFlow,
      vapourMassFlow,
      liquidVolFlow,
      vapourVolFlow,
    };
  }

  private physicalConditions(lines: string[], numberOfTrays: number) {
    const liquidMolWeight: number[] = [];
    const vapourMolWeight: number[] = [];
    const liquidMassDensity: number[] = [];
    const vapourMassDensity: number[] = [];
    const liquidViscosity: number[] = [];
    const vapourViscosity: number[] = [];
    const surfaceTension: number[] = [];
    const workingRange = this.utilsService.defineWorkingRange(lines, numberOfTrays, "Физическое состояние");

    const splitedLines = this.utilsService.arrayElementSplit(workingRange, " ");
    const filteredLines = this.utilsService.deleteEmptyElements(splitedLines);

    for (let i = 0; i < filteredLines.length; i++) {
      if (filteredLines[i] === "Tower") {
        liquidMolWeight.push(parseFloat(filteredLines[i + 1]));
        vapourMolWeight.push(parseFloat(filteredLines[i + 2]));
        liquidMassDensity.push(parseFloat(filteredLines[i + 3]));
        vapourMassDensity.push(parseFloat(filteredLines[i + 4]));
        liquidViscosity.push(parseFloat(filteredLines[i + 5]));
        vapourViscosity.push(parseFloat(filteredLines[i + 6]));
        surfaceTension.push(parseFloat(filteredLines[i + 7]));
      }
    }

    return {
      liquidMolWeight,
      vapourMolWeight,
      liquidMassDensity,
      vapourMassDensity,
      liquidViscosity,
      vapourViscosity,
      surfaceTension,
    };
  }

  // Давление по тарелкам
  private pressureData(workingRange: string[]): number[] {
    const pressureList: number[] = [];

    const splitedLines = this.utilsService.arrayElementSplit(workingRange, " ");
    const filteredLines = this.utilsService.deleteEmptyElements(splitedLines);

    for (let i = 0; i < filteredLines.length; i++) {
      if (filteredLines[i] === "Tower") {
        pressureList.push(parseFloat(filteredLines[i + 1]));
      }
    }

    return pressureList;
  }

  // Нужно рефакторить
  private feedProductStreams(lines: string[], numberOfTrays: number, isCondenser, isReboiler) {
    const workingRange: string[] = [];
    let startPosition = 0;
    let endPosition = 0;
    let columnStreamData: string[] = [];
    let tempStage: string = "";
    const feedStages = {};
    const drawStages = {};

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("Базис расхода: Молярный")) {
        startPosition = i + 3;
      }
      if (lines[i].includes("НАСТРОЙКА")) {
        endPosition = i;
      }
    }

    for (let i = startPosition; i < endPosition; i++) {
      workingRange.push(lines[i]);
    }

    const splitedLines = this.utilsService.arrayElementSplit(workingRange, " ");
    const splitedLines1 = this.utilsService.arrayElementSplit(splitedLines, "__");
    const filteredLines = this.utilsService.deleteEmptyElements(splitedLines1);

    // Дополнительная очистка рабочего участка текста
    for (let i = 0; i < filteredLines.length; i++) {
      if (filteredLines[i] === "Энергия") {
        filteredLines[i] = "Delete";
        filteredLines[i - 1] = "Delete";
        filteredLines[i + 1] = "Delete";
        filteredLines[i + 2] = "Delete";
        filteredLines[i + 3] = "Delete";
        filteredLines[i + 4] = "Delete";
        filteredLines[i + 5] = "Delete";
      }
    }

    columnStreamData = filteredLines.filter((item) => item !== "Delete");

    for (let i = 0; i < columnStreamData.length; i++) {
      if (columnStreamData[i] === "Сырье" && columnStreamData[i - 3] === "Main") {
        tempStage = columnStreamData[i - 4];
        feedStages[columnStreamData[i - 1]] = tempStage;
      }
      if (columnStreamData[i] === "Сырье" && columnStreamData[i - 3] !== "Main") {
        feedStages[columnStreamData[i - 1]] = tempStage;
      }

      if (
        columnStreamData[i] === "Изобразить" &&
        (columnStreamData[i - 2] === "Condenser" || columnStreamData[i - 9] === "Condenser")
      ) {
        tempStage = "Condenser";
        drawStages[columnStreamData[i - 1]] = tempStage;
      }
      if (columnStreamData[i] === "Изобразить" && columnStreamData[i - 3] === "Main") {
        tempStage = columnStreamData[i - 4];
        drawStages[columnStreamData[i - 1]] = tempStage;
      }
      if (columnStreamData[i] === "Изобразить" && columnStreamData[i - 3] !== "Main") {
        drawStages[columnStreamData[i - 1]] = tempStage;
      }
      if (columnStreamData[i] === "Изобразить" && columnStreamData[i - 2] === "Reboiler") {
        tempStage = "Reboiler";
        drawStages[columnStreamData[i - 1]] = tempStage;
      }
    }

    return { feedStages, drawStages };
  }

  private internalExternalStreams(workingRange: string[]): {} {
    const internalExternal = {};

    const splitedLines = this.utilsService.arrayElementSplit(workingRange, " ");
    const filteredLines = this.utilsService.deleteEmptyElements(splitedLines);

    for (let i = 0; i < filteredLines.length; i++) {
      if (filteredLines[i] === "@Main") {
        internalExternal[filteredLines[i - 2]] = filteredLines[i - 1];
      }
    }

    return internalExternal;
  }
}
