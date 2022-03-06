import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {

	// Удаляет пустые элементы из массива
	deleteEmptyElements(line: string[]) {
		const cleanLine: string[] = [];
		for (const elem of line) {
			if (elem.length !== 0) {
				cleanLine.push(elem);
			}
		}

		return cleanLine;
	}

	// Применяет метод split к элементам массива
	arrayElementSplit(arr: string[], separator: string): string[] {
		const splitedArr = [];
		const resultingArr = [];
		for (const elem of arr) {
			splitedArr.push(elem.split(separator));
		}

		for (const elem of splitedArr) {
			for (const item of elem) {
				resultingArr.push(item);
			}
		}
		return resultingArr;
	}
}