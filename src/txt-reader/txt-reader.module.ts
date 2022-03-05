import { Module } from '@nestjs/common';
import { TxtReaderController } from './txt-reader.controller';
import { TxtReaderService } from './txt-reader.service';
import { UtilsService } from './utils.service';

@Module({
  controllers: [TxtReaderController],
  providers: [TxtReaderService, UtilsService]
})
export class TxtReaderModule {}
