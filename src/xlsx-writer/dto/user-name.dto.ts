import { IsString } from "class-validator";

export class UserNameDto {
  @IsString()
  userName: string;
}
