import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { createReadStream } from "fs";
import { UserName } from "./decorators/user-name.decorator";
import { FileElementResponse } from "./files-upload/dto/file-element.response";
import { FilesUploadService } from "./files-upload/files-upload.service";
import { UserNameInterceptor } from "./interseptors/user-name.interceptor";
import { TxtReaderService } from "./txt-reader/txt-reader.service";
import { XlsxReaderService } from "./xlsx-reader/xlsx-reader.service";
import { AddStreamDto } from "./xlsx-writer/dto/add-stream.dto";
import { XlsxWriterService } from "./xlsx-writer/xlsx-writer.service";
import { path } from "app-root-path";
import { UserNameDto } from "./xlsx-writer/dto/user-name.dto";

@Controller()
export class AppController {
  constructor(
    private readonly xlsxWriterService: XlsxWriterService,
    private readonly xlsReaderService: XlsxReaderService,
    private readonly txtDataService: TxtReaderService,
    private readonly filesUploadService: FilesUploadService,
  ) {}

  @Post("upload")
  @HttpCode(200)
  @UseInterceptors(FileInterceptor("files"), UserNameInterceptor)
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @UserName() userName: string,
  ): Promise<FileElementResponse[]> {
    if (file.originalname.split(".").includes("txt") || file.originalname.split(".").includes("xlsx")) {
      // this.filesUploadService.deleteAllFiles(userName);
      return this.filesUploadService.saveFiles([file], userName);
    } else {
      throw new ForbiddenException("Приложение не поддерживает данный формат файлов");
    }
  }

  @Get()
  @HttpCode(200)
  @UseInterceptors(UserNameInterceptor)
  async getAllData(@UserName() userName: string) {
    try {
      let additionalStreams: AddStreamDto = {
        addFeedStreams: [],
        addDrawStreams: [],
      };
      this.filesUploadService.deleteAllFiles(userName);
      const txtData = await this.txtDataService.parseTXTFile(userName);
      const excelData = await this.xlsReaderService.parseXlsxFile(additionalStreams, txtData, userName);

      return { txtData, excelData };
    } catch (e) {
      throw new BadRequestException("Не удалось выполнить запрос");
    }
  }

  @Post()
  @HttpCode(201)
  @UseInterceptors(UserNameInterceptor)
  async createExcelFile(@Body() additionalStreams: AddStreamDto, @UserName() userName: string): Promise<void> {
    try {
      const txtData = await this.txtDataService.parseTXTFile(userName);
      const excelData = await this.xlsReaderService.parseXlsxFile(additionalStreams, txtData, userName);

      await this.xlsxWriterService.createXlsxFile(txtData, excelData, userName);
    } catch (e) {
      throw new BadRequestException("Не удалось выполнить запрос");
    }
  }

  @Post("get-name")
  @HttpCode(201)
  async findSameFolder(@Body() userInfo: UserNameDto): Promise<void> {
    const folders = await this.filesUploadService.sameDir();
    if (folders.includes(userInfo.userName)) {
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }
  }

  @Get("download")
  @HttpCode(200)
  @UseInterceptors(UserNameInterceptor)
  async getResultFiel(@UserName() userName: string): Promise<StreamableFile> {
    try {
      const file = createReadStream(`${path}/result/${userName}/column_info.xlsx`);

      return new StreamableFile(file);
    } catch (e) {
      throw new BadRequestException("Не удается скачать файл");
    }
  }
}
