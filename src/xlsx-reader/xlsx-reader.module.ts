import { Module } from '@nestjs/common';
import { XlsxReaderService } from './xlsx-reader.service';
import { XlsxReaderController } from './xlsx-reader.controller';

@Module({
  providers: [XlsxReaderService],
  controllers: [XlsxReaderController]
})
export class XlsxReaderModule {}
