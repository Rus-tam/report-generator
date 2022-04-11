import { IsArray, IsString } from "class-validator";

export class AddStreamDto {
  @IsString({ each: true })
  addFeedStreams: string[];

  @IsString({ each: true })
  addDrawStreams: string[];
}
