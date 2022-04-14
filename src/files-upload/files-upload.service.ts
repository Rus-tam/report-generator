import { Injectable } from "@nestjs/common";
import { FileElementResponse } from "./dto/file-element.response";
import { path } from "app-root-path";
import { writeFile, rmdir, ensureDir, readdir, unlink } from "fs-extra";
import { fstat } from "fs";
import * as encoding from "encoding";

@Injectable()
export class FilesUploadService {
  async saveFiles(files: Express.Multer.File[]): Promise<FileElementResponse[]> {
    const uploadFolder = `${path}/files`;
    await ensureDir(uploadFolder);

    const res: FileElementResponse[] = [];
    for (let file of files) {
      if (file.originalname.split(".").includes("txt")) {
        let text = encoding.convert(file.buffer, "UTF-8", "WINDOWS-1251");
        await writeFile(`${uploadFolder}/${file.originalname}`, text);
      } else {
        await writeFile(`${uploadFolder}/${file.originalname}`, file.buffer);
      }

      res.push({ url: `${uploadFolder}/${file.originalname}`, name: file.originalname });
    }
    return res;
  }

  async deleteAllFiles() {
    const dirFiles: string[] = await readdir(`${path}/files`);

    for (let file of dirFiles) {
      try {
        unlink(`${path}/files/${file}`);
      } catch (e) {
        continue;
      }
    }

    // Для удаления директории
    // rmdir(`${path}/files/${dirName}`, { recursive: true });
  }
}
