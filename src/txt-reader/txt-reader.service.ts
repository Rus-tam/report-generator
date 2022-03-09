import { Injectable } from "@nestjs/common";
import { stat } from "fs";
import * as fs from "fs/promises";
import { UtilsService } from "../utils/utils.service";

@Injectable()
export class TxtReaderService {
  constructor(private readonly utilsService: UtilsService) {}

  async parseTXTFile() {
    const data: string = await fs.readFile("src/files/internals.txt", "utf8");
    const lines = data.split("\n");

    const numberOfTrays = this.trayNumber(lines);

    const trayEffincies = this.trayEfficiencies(lines, numberOfTrays);

    const stateCond = this.stateConditions(lines, numberOfTrays);

    console.log(stateCond);
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
  private trayEfficiencies(lines: string[], numberOfTrays: number): string[] {
    let startPosition = 0;
    let endPosition = 0;
    let workingRange: string[] = [];
    let isCondenser = false;
    let trayEfficiencies: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("КПД ступеней")) {
        startPosition = i;
      }
      if (lines[i].includes("Condenser")) {
        isCondenser = true;
      }
    }

    // В выгрузке КПД конденсатора и ребойлера включается в кпд ступеней.
    // Тут идет корректировка выборки значений
    isCondenser ? (startPosition = startPosition + 3) : null;
    endPosition = startPosition + numberOfTrays;

    for (let i = startPosition; i < endPosition; i++) {
      workingRange.push(lines[i]);
    }

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
    const workingRange = this.utilsService.defineWorkingRange(
      lines,
      numberOfTrays,
      "Режим работы",
    );

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
}
