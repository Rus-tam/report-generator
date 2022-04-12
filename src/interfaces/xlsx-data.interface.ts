import { IStreamCompositionExtr } from "./stream-compositions-extraction.interface";
import { IStreamPropertyObj } from "./streams-properties-obj.interface";

export interface IXlsxData {
  feedCompositions: IStreamCompositionExtr;
  drawCompositions: IStreamCompositionExtr;
  feedProperties: IStreamPropertyObj;
  drawProperties: IStreamPropertyObj;
  allStreams: string[];
}
