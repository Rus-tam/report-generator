import { Injectable } from "@nestjs/common";
import { FileElementResponse } from "./dto/file-element.response";
import { path } from "app-root-path";
import { writeFile, rmdir, ensureDir, readdir, unlink, stat } from "fs-extra";
import * as encoding from "encoding";
import { ICreatedAt } from "src/interfaces/createdAt.interface";
import { MainUtilsService } from "src/utils/main-utils.service";

@Injectable()
export class FilesUploadService {
  constructor(private readonly mainUtilsService: MainUtilsService) {}

  async saveFiles(files: Express.Multer.File[], userName: string): Promise<FileElementResponse[]> {
    const uploadFolder = `${path}/files/${userName}`;
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

  async sameDir(): Promise<string[]> {
    const folderPath = `${path}/files`;
    await ensureDir(folderPath);
    const folderFiles = await readdir(folderPath);

    return folderFiles;
  }

  async deleteAllFiles(userName: string): Promise<void> {
    let txtNumber = 0;
    let xlsxNumber = 0;
    const createTime: ICreatedAt[] = [];
    const deletingFolder = `${path}/files/${userName}`;
    await ensureDir(deletingFolder);
    const dirFiles: string[] = await readdir(deletingFolder);
    for (let file of dirFiles) {
      file.split(".").pop() === "txt" ? txtNumber++ : null;
      file.split(".").pop() === "xlsx" ? xlsxNumber++ : null;
    }
    for await (let file of dirFiles) {
      const statistics = stat(`${path}/files/${userName}/${file}`);

      createTime.push({
        fileName: file,
        createdAt: (await statistics).ctimeMs,
      });
    }

    if (txtNumber > 1) {
      const saveTxt = this.mainUtilsService.latestCreated(createTime, "txt");
      this.mainUtilsService.deleteOldFiles(dirFiles, "txt", userName, saveTxt);
    } else if (xlsxNumber > 1) {
      const saveXlsx = this.mainUtilsService.latestCreated(createTime, "xlsx");
      this.mainUtilsService.deleteOldFiles(dirFiles, "xlsx", userName, saveXlsx);
    }
  }
}
