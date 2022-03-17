export interface ITxtData {
  colNumb: string;
  trayEfficiencies: string[];
  stateCond: {
    liquidTemp: number[];
    vapourTemp: number[];
    liquidMassFlow: number[];
    vapourMassFlow: number[];
    liquidVolFlow: number[];
    vapourVolFlow: number[];
  };
  physicalCond: {
    liquidMolWeight: number[];
    vapourMolWeight: number[];
    liquidMassDensity: number[];
    vapourMassDensity: number[];
    liquidViscosity: number[];
    vapourViscosity: number[];
    surfaceTension: number[];
  };
  pressureList: number[];
  feedStages: {};
  drawStages: {};
  internalExternalStr: {};
}
