import { Injectable } from "@nestjs/common";
import { FileElementResponse } from "./dto/file-element.response";
import { path } from "app-root-path";
import { ensureDir, writeFile } from "fs-extra";
import { format } from "date-fns";

@Injectable()
export class FilesUploadService {
  async saveFiles(files: Express.Multer.File[]): Promise<FileElementResponse[]> {
    const uploadFolder = `${path}/src/files`;
    const res: FileElementResponse[] = [];
    for (let file of files) {
      await writeFile(`${uploadFolder}/${file.originalname}`, file.buffer);
      res.push({ url: `${uploadFolder}/${file.originalname}`, name: file.originalname });
    }
    return res;
  }
}
