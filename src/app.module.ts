import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TxtReaderModule } from './txt-reader/txt-reader.module';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [TxtReaderModule, UtilsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
