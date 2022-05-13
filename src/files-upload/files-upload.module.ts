import { Module } from "@nestjs/common";
import { UtilsModule } from "src/utils/utils.module";
import { FilesUploadService } from "./files-upload.service";

@Module({
  imports: [UtilsModule],
  providers: [FilesUploadService],
  exports: [FilesUploadService],
})
export class FilesUploadModule {}
