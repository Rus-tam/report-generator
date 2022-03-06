import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import  { UtilsService } from '../utils/utils.service';

@Injectable()
export class TxtReaderService {
	constructor(private readonly utilsService: UtilsService) {}

	async parseTXTFile() {
		const data: string = await fs.readFile('src/files/internals.txt', 'utf8');
		const lines = data.split('\n');
		const numberOfTrays = await this.trayNumber(lines);
		
		console.log(numberOfTrays);
	}

	private async trayNumber(lines: string[]): Promise<number> {
		let linesFirstIter: string[] = [];
		let splitedArr: string[] = [];
		const startEndTrays: number[] = [];

		lines.forEach(line => {
			if (line.includes('CS-1') && line.includes('1__Main Tower')) {
				linesFirstIter = this.utilsService.deleteEmptyElements(line.split(' '));
				splitedArr = this.utilsService.arrayElementSplit(linesFirstIter, '__');
			}
		});

		for (let i = 0; i < splitedArr.length; i++) {
			try {
				if (splitedArr[i] === 'Main') {
					startEndTrays.push(parseInt(splitedArr[i-1]));
				}
			} catch (e) {
				return null;
			}
		}

		return Math.max.apply(Math, startEndTrays);
	}
}
