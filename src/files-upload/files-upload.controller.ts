import { Controller, Get, HttpCode, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileElementResponse } from "./dto/file-element.response";
import { FilesUploadService } from "./files-upload.service";

@Controller("files-upload")
export class FilesUploadController {
  constructor(private readonly filesUploadService: FilesUploadService) {}

  @Post("upload")
  @HttpCode(200)
  @UseInterceptors(FileInterceptor("files"))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<FileElementResponse[]> {
    return this.filesUploadService.saveFiles([file]);
  }
}
