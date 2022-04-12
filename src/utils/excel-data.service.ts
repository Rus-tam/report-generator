import { Injectable } from "@nestjs/common";
import { IJsonCreator } from "src/interfaces/json-creator.interface";
import { ILiquidVapourLoad } from "src/interfaces/liquid-vapour-loads.interface";
import { IReportExcelData } from "src/interfaces/report-excel-data.interface";
import { IStreamProp } from "src/interfaces/stream-prop.interface";
import { IStreamPropertyObj } from "src/interfaces/streams-properties-obj.interface";
import { ITxtData } from "src/interfaces/txt-data.interface";
import { IXlsxData } from "src/interfaces/xlsx-data.interface";
import { AddStreamDto } from "src/xlsx-writer/dto/add-stream.dto";
import { MainUtilsService } from "./main-utils.service";

@Injectable()
export class ExcelDataService {
  constructor(public readonly mainUtils: MainUtilsService) {}

  // Создаем json на основе данных из текстового документа для основной страницы
  mainJsonCreator(txtData: ITxtData, xlsxData: IXlsxData, additionalStreams: AddStreamDto): IJsonCreator[] {
    let { addFeedStreams, addDrawStreams } = additionalStreams;
    const { numberOfTrays, trayEfficiencies, stateCond, physicalCond, feedStages, drawStages, ...rest } = txtData;
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

    // Убираем пустые массивы
    addFeedStreams = addFeedStreams.filter((stream) => stream.length !== 0);
    addDrawStreams = addDrawStreams.filter((stream) => stream.length !== 0);

    let feedProp: IStreamPropertyObj = xlsxData.feedProperties;
    let drawProp: IStreamPropertyObj = xlsxData.drawProperties;

    const excelData: IJsonCreator[] = [];

    let feedStreams = [...this.mainUtils.objectKeyFinder(feedProp), ...addFeedStreams];
    let drawStreams = [...this.mainUtils.objectKeyFinder(drawProp), ...addDrawStreams];

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

  // Создаем json для страницы с составом потоков
  componentJsonCreator(xlsxData: IXlsxData) {
    const excelData = [];
    const fractions = [];
    let title = {};

    const { feedCompositions, drawCompositions } = xlsxData;

    const compositions = Object.assign({}, feedCompositions, drawCompositions);

    const feedStreams = this.mainUtils.objectKeyFinder(xlsxData.feedProperties);
    const drawStreams = this.mainUtils.objectKeyFinder(xlsxData.drawProperties);
    const combinedStreams = ["Компоненты", ...feedStreams, ...drawStreams];
    const streams = combinedStreams.filter(
      (stream) =>
        !stream.includes("Reflux") &&
        !stream.includes("Condenser") &&
        !stream.includes("Boilup") &&
        !stream.includes("Reboiler"),
    );

    const components = this.mainUtils.objectKeyFinder(feedCompositions[feedStreams[0]]);

    for (let component of components) {
      let fracContainer = [];
      for (let key in compositions) {
        fracContainer.push(compositions[key][component]);
      }
      fractions.push([component, ...fracContainer]);
    }

    // Заполняем заголовок таблицы
    for (let i = 0; i < streams.length; i++) {
      title[i] = streams[i];
    }
    excelData.push(title);

    // Заполняем значения для таблицы
    for (let frac of fractions) {
      title = {};
      for (let i = 0; i < frac.length; i++) {
        title[i] = frac[i];
      }
      excelData.push(title);
    }

    return excelData;
  }

  // На данном этапе пользователь должен выбрать потоки питания колонны. Сделать дополнительную
  // фильтрацию потоков на фронте
  mainColumnJsonCreater(txtData: ITxtData, xlsxData: IXlsxData) {
    let isReboiler: boolean = false;
    let isCondenser: boolean = false;
    let topStageDrawStream: string = "";
    let topStageDrawStreamProp: IStreamProp;
    let bottomStageDrawStream: string = "";
    let bottomStageDrawStreamProp: IStreamProp;
    let temperatureProfile: {}[] = [];
    let pressureProfile: {}[] = [];
    let feedRatesProfile: {}[] = [];
    let drawRatesProfile: {}[] = [];
    let excelData: IReportExcelData[] = [];
    let efficiency: string = "";

    const { heatFlow, feedStages, drawStages, numberOfTrays, stateCond, pressureList, trayEfficiencies } = txtData;
    const { feedProperties, drawProperties } = xlsxData;

    const drawStreams = this.mainUtils.objectKeyFinder(drawProperties);

    const feedTrays = this.mainUtils
      .objectValueFinder(feedStages)
      .sort((a: string, b: string) => parseInt(a) - parseInt(b));
    const drawTrays = this.mainUtils.objectValueFinder(drawStages);

    // КПД тарелок
    const trayEff = this.mainUtils.trayEfficiensyRange(trayEfficiencies);
    trayEff.forEach((tray) => {
      efficiency = efficiency + " " + tray.toString();
    });

    heatFlow.condenserHeat !== "0" ? (isCondenser = true) : null;
    heatFlow.reboilerHeat !== "0" ? (isReboiler = true) : null;

    // Определяем свойства потоков с верхней и нижней тарелок. Нужно для определения условий
    // верхней и нижней тарелке.
    if (isCondenser) {
      topStageDrawStream = drawStreams.find((stream) => stream.includes("Condenser"));
      topStageDrawStreamProp = drawProperties[topStageDrawStream];
    } else {
      for (let stream in drawStages) {
        drawStages[stream] === "1" ? (topStageDrawStream = stream) : null;
      }
      topStageDrawStreamProp = drawProperties[topStageDrawStream];
    }
    if (isReboiler) {
      bottomStageDrawStream = drawStreams.find((stream) => stream.includes("Reboiler"));
      bottomStageDrawStreamProp = drawProperties[bottomStageDrawStream];
    } else {
      for (let stream in drawStages) {
        drawStages[stream] === numberOfTrays.toString() ? (bottomStageDrawStream = stream) : null;
      }
      bottomStageDrawStreamProp = drawProperties[bottomStageDrawStream];
    }

    excelData.push({
      Position: "№",
      Parameters: "Наименование параметра",
      Value: "Значение параметра",
    });

    // Определяем давления, температуры, сырье и расходы для таблицы
    for (let tray of feedTrays) {
      let tempObj = {};
      tempObj[tray] = `${stateCond.liquidTemp[parseFloat(tray) - 1]} / ${stateCond.vapourTemp[parseFloat(tray) - 1]}`;
      temperatureProfile.push(tempObj);

      tempObj = {};
      tempObj[tray] = `${pressureList[parseFloat(tray) - 1]}`;
      pressureProfile.push(tempObj);

      tempObj = {};
      tempObj[tray] = `${this.mainUtils.flowRatesDefiner(tray, feedStages, feedProperties)}`;
      feedRatesProfile.push(tempObj);
    }
    for (let tray of drawTrays) {
      let tempObj = {};
      tempObj[tray] = `${this.mainUtils.flowRatesDefiner(tray, drawStages, drawProperties)}`;
      drawRatesProfile.push(tempObj);
    }

    // Заполняем таблицу данными
    for (let i = 0; i < pressureProfile.length; i++) {
      if (i === 0) {
        excelData.push({
          Position: "1",
          Parameters: "Давление, МПа",
          Value: " ",
        });
      }

      excelData.push({
        Position: " ",
        Parameters: `На ${Object.keys(pressureProfile[i])[0]} ступени`,
        Value: `${Object.values(pressureProfile[i])[0]}`,
      });
    }

    for (let i = 0; i < temperatureProfile.length; i++) {
      if (i === 0) {
        excelData.push({
          Position: "2",
          Parameters: "Температура жидк. / пара, град C",
          Value: " ",
        });
      }
      excelData.push({
        Position: " ",
        Parameters: `На ${Object.keys(temperatureProfile[i])[0]} ступени`,
        Value: `${Object.values(temperatureProfile[i])[0]}`,
      });
    }

    for (let i = 0; i < feedRatesProfile.length; i++) {
      if (i === 0) {
        excelData.push({
          Position: "3",
          Parameters: "Потоки питания, кг/ч",
          Value: " ",
        });
      }
      excelData.push({
        Position: " ",
        Parameters: `На ${Object.keys(feedRatesProfile[i])[0]} ступень`,
        Value: `${Object.values(feedRatesProfile[i])[0]}`,
      });
    }

    for (let i = 0; i < drawRatesProfile.length; i++) {
      if (i === 0) {
        excelData.push({
          Position: "4",
          Parameters: "Продуктовые потоки, кг/ч",
          Value: " ",
        });
      }
      if (Object.keys(drawRatesProfile[i])[0] === "Condenser") {
        excelData.push({
          Position: " ",
          Parameters: `С конденсатора`,
          Value: `${Object.values(drawRatesProfile[i])[0]}`,
        });
      } else if (Object.keys(drawRatesProfile[i])[0] === "Reboiler") {
        excelData.push({
          Position: " ",
          Parameters: `С ребойлера`,
          Value: `${Object.values(drawRatesProfile[i])[0]}`,
        });
      } else {
        excelData.push({
          Position: " ",
          Parameters: `С ${Object.keys(drawRatesProfile[i])[0]} ступени`,
          Value: `${Object.values(drawRatesProfile[i])[0]}`,
        });
      }
    }
    excelData.push({
      Position: "5",
      Parameters: "Тепловая нагрузка, МВт",
      Value: " ",
    });
    excelData.push({
      Position: " ",
      Parameters: "-теплоотвод",
      Value: heatFlow.condenserHeat,
    });
    excelData.push({
      Position: " ",
      Parameters: "-теплоподвод",
      Value: heatFlow.reboilerHeat,
    });
    excelData.push({
      Position: "6",
      Parameters: "Принятый КПД ВКУ",
      Value: efficiency,
    });
    return excelData;
  }

  vapourLiquidJsonCreator(txtData: ITxtData): ILiquidVapourLoad[] {
    const { numberOfTrays, trayEfficiencies, stateCond, physicalCond } = txtData;
    let excelData: ILiquidVapourLoad[] = [];

    // Начинаем заполнять таблицу
    excelData.push({
      position: "№",
      liquidTemp: "Т ж-ти, С",
      vapourTemp: "Т газа, С",
      liquidMassFlow: "Масс.расх.жидк., кг/ч",
      vapourMassFlow: "Масс.расх.газ., кг/ч",
      liquidVolFlow: "Объем.расх.жидк., м3/ч",
      vapourVolFlow: "Объем.расх.газа., м3/ч",
      liquidMolWeight: "Молекул.вес ж-ти",
      vapourMolWeight: "Молекул.вес газа",
      liquidMassDens: "Плотность ж-ти, кг/м3",
      vapourMassDens: "Плотность газа, кг/м3",
      liquidViscosity: "Вязкость ж-ти, сП",
      vapourViscosity: "Вязкость газа, сП",
      surfaceTension: "Пов.натяжение, дин/см",
    });

    for (let i = 0; i < numberOfTrays; i++) {
      excelData.push({
        position: i + 1,
        liquidTemp: stateCond.liquidTemp[i],
        vapourTemp: stateCond.vapourMassFlow[i],
        liquidMassFlow: stateCond.liquidMassFlow[i],
        vapourMassFlow: stateCond.vapourMassFlow[i],
        liquidVolFlow: stateCond.liquidVolFlow[i],
        vapourVolFlow: stateCond.vapourVolFlow[i],
        liquidMolWeight: physicalCond.liquidMolWeight[i],
        vapourMolWeight: physicalCond.vapourMolWeight[i],
        liquidMassDens: physicalCond.liquidMassDensity[i],
        vapourMassDens: physicalCond.vapourMassDensity[i],
        liquidViscosity: physicalCond.liquidViscosity[i],
        vapourViscosity: physicalCond.vapourViscosity[i],
        surfaceTension: physicalCond.surfaceTension[i],
      });
    }

    return excelData;
  }
}
