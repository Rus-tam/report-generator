export interface IJsonCreator {
  trayNumber: number | null | string;
  trayEfficiencies: number | null | string;
  liquidTemp: number | null | string;
  liquidMassFlow: number | null | string;
  liquidVolFlow: number | null | string;
  liquidMassDensity: number | null | string;
  liquidMolWeight: number | null | string;
  liquidViscosity: number | null | string;
  surfaceTension: number | null | string;
  additionalField1: number | null | string;
  additionalField2: number | null | string;
}
