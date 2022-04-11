import { IStreamCompositionExtr } from "./stream-compositions-extraction.interface";

export interface IXlsxData {
  feedCompositions: IStreamCompositionExtr;
  drawCompositions: IStreamCompositionExtr;
  feedProperties: {};
  drawProperties: {};
  allStreams: string[];
}
