import { Injectable } from "@nestjs/common";
import { IJsonCreator } from "src/interfaces/jsonCreator.interface";
import { ITxtData } from "src/interfaces/txtData.interface";
import { IXlsxData } from "src/interfaces/xlsxData.interface";
import { MainUtilsService } from "./mainUtils.service";

@Injectable()
export class ExcelDataService {
  constructor(public readonly mainUtils: MainUtilsService) {}

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

    const feedStreams = this.mainUtils.objectKeyFinder(xlsxData.feedProperties);
    const drawStreams = this.mainUtils.objectKeyFinder(xlsxData.drawProperties);

    const streamStagePairFeed = this.mainUtils.streamStagePairMaker(feedStages, feedStreams);
    const streamStagePairDraw = this.mainUtils.streamStagePairMaker(drawStages, drawStreams);

    for (let i = 0; i < numberOfTrays * 2 + 3 + feedStreams.length + drawStreams.length + 10; i++) {
      if (i === 0) {
        excelData.push({
          trayNumber: "Номер тарелки",
          trayEfficiencies: "КПД тарелки",
          liquidTemp: "Температура жидкости [C]",
          liquidMassFlow: "Масс. расход жидкости [kg/h]",
          liquidVolFlow: "Объем. расход жидкости [m3/h]",
          liquidMassDensity: "Плотность жидкости [kg/m3]",
          liquidMolWeight: "Молекулярный вес жидкости",
          liquidViscosity: "Вязкость жидкости [cP]",
          surfaceTension: "Поверхностное натяжение [dyne/cm]",
          additionalField1: null,
          additionalField2: null,
        });
      } else if (i < numberOfTrays && i > 0) {
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
      } else if (i === numberOfTrays + 2) {
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
      } else if (i === numberOfTrays + 3) {
        excelData.push({
          trayNumber: "Номер тарелки",
          trayEfficiencies: "КПД тарелки",
          liquidTemp: "Температура пара [C]",
          liquidMassFlow: "Масс. расход пара [kg/h]",
          liquidVolFlow: "Объем. расход пара [m3/h]",
          liquidMassDensity: "Плотность пара [kg/m3]",
          liquidMolWeight: "Молекулярный вес пара",
          liquidViscosity: "Вязкость пара [cP]",
          surfaceTension: null,
          additionalField1: null,
          additionalField2: null,
        });
      } else if (i > numberOfTrays + 3 && i < numberOfTrays * 2 + 4) {
        excelData.push({
          trayNumber: i - numberOfTrays - 3,
          trayEfficiencies: trayEfficiencies[i - numberOfTrays - 4],
          liquidTemp: vapourTemp[i - numberOfTrays - 4],
          liquidMassFlow: vapourMassFlow[i - numberOfTrays - 4],
          liquidVolFlow: vapourVolFlow[i - numberOfTrays - 4],
          liquidMassDensity: vapourMassDensity[i - numberOfTrays - 4],
          liquidMolWeight: vapourMolWeight[i - numberOfTrays - 4],
          liquidViscosity: vapourViscosity[i - numberOfTrays - 4],
          surfaceTension: null,
          additionalField1: null,
          additionalField2: null,
        });
      } else if (i === numberOfTrays * 2 + 4) {
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
      } else if (i === numberOfTrays * 2 + 5) {
        excelData.push({
          trayNumber: "Вход. поток / Ступень ввода",
          trayEfficiencies: "Доля пара",
          liquidTemp: "Температура [C]",
          liquidMassFlow: "Давление [MPa]",
          liquidVolFlow: "Мольный расход [kgmole/h]",
          liquidMassDensity: "Массовый расход [kg/h]",
          liquidMolWeight: "Тепловой поток [MW]",
          liquidViscosity: "Молекулярный вес",
          surfaceTension: "Массовая плотность [kg/m3]",
          additionalField1: "Объемный расход пара [m3/h]",
          additionalField2: "Объемный расход жидкости [m3/h]",
        });
      } else if (i > numberOfTrays * 2 + 5 && i <= numberOfTrays * 2 + 5 + feedStreams.length) {
        let feedStream = feedStreams[i - (numberOfTrays * 2 + 6)];
        let feedStagePair = streamStagePairFeed[i - (numberOfTrays * 2 + 6)];
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
      } else if (i === numberOfTrays * 2 + 6 + feedStreams.length) {
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
      } else if (i === numberOfTrays * 2 + 7 + feedStreams.length) {
        excelData.push({
          trayNumber: "Выход.поток / Ступень вывода",
          trayEfficiencies: "Доля пара",
          liquidTemp: "Температура [C]",
          liquidMassFlow: "Давление [MPa]",
          liquidVolFlow: "Мольный расход [kgmole/h]",
          liquidMassDensity: "Массовый расход [kg/h]",
          liquidMolWeight: "Тепловой поток [MW]",
          liquidViscosity: "Молекулярный вес",
          surfaceTension: "Плотность [kg/m3]",
          additionalField1: "Объемный расход пара [m3/h]",
          additionalField2: "Объемный расход жидкости [m3/h]",
        });
      } else if (
        i > numberOfTrays * 2 + 7 + feedStreams.length &&
        i <= numberOfTrays * 2 + 7 + feedStreams.length + drawStreams.length
      ) {
        let drawStream = drawStreams[i - (numberOfTrays * 2 + 8 + feedStreams.length)];
        let drawStagePair = streamStagePairDraw[i - (numberOfTrays * 2 + 8 + feedStreams.length)];
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
