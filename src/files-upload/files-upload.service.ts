import { Injectable } from "@nestjs/common";
import { FileElementResponse } from "./dto/file-element.response";
import { path } from "app-root-path";
import { ensureDir, writeFile, readdir, readFile } from "fs-extra";
import { format } from "date-fns";
import * as iconv from "iconv-lite";
import { Buffer } from "buffer";
import { fstat } from "fs";

@Injectable()
export class FilesUploadService {
  async saveFiles(files: Express.Multer.File[]): Promise<FileElementResponse[]> {
    const uploadFolder = `${path}/files`;
    const res: FileElementResponse[] = [];
    for (let file of files) {
      await writeFile(`${uploadFolder}/${file.originalname}`, file.buffer);
      res.push({ url: `${uploadFolder}/${file.originalname}`, name: file.originalname });
    }
    return res;
  }

  async changeEncoding() {
    const dirFiles: string[] = await readdir(`${path}/files`);

    const fileName = dirFiles.find((file) => file.split(".").includes("txt"));
  }
}
