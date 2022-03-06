import { Controller, Get } from '@nestjs/common';
import { TxtReaderService } from './txt-reader.service';

@Controller('txt-reader')
export class TxtReaderController {
	constructor(private readonly txtReaderService: TxtReaderService) {}

	@Get()
	async readTxtFile() {
		await this.txtReaderService.parseTXTFile();
	}
}
