import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TxtReaderModule } from "./txt-reader/txt-reader.module";
import { UtilsModule } from "./utils/utils.module";
import { XlsxReaderModule } from './xlsx-reader/xlsx-reader.module';
import { XlsxWriterModule } from './xlsx-writer/xlsx-writer.module';

@Module({
  imports: [TxtReaderModule, UtilsModule, XlsxReaderModule, XlsxWriterModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
