import { Injectable } from "@nestjs/common";
import { FileElementResponse } from "./dto/file-element.response";
import { path } from "app-root-path";
import { writeFile, rmdir, ensureDir, readdir, unlink } from "fs-extra";
import * as encoding from "encoding";

@Injectable()
export class FilesUploadService {
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

  async deleteAllFiles(userName: string): Promise<void> {
    let deleteTxt: string = "";
    let deleteXlsx: string = "";
    const deletingFolder = `${path}/files/${userName}`;
    await ensureDir(deletingFolder);
    const dirFiles: string[] = await readdir(deletingFolder);

    if (dirFiles.length > 1) {
      deleteTxt = dirFiles.find((file) => file.split(".").pop() === "txt");
      deleteXlsx = dirFiles.find((file) => file.split(".").pop() === "xlsx");

      try {
        unlink(`${path}/files/${userName}/${deleteTxt}`);
        unlink(`${path}/files/${userName}/${deleteXlsx}`);
      } catch (e) {
        console.log(e);
      }
    }

    // Для удаления директории
    // rmdir(`${path}/files/${dirName}`, { recursive: true });
  }
}
