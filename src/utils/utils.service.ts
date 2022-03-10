import { Injectable } from "@nestjs/common";

@Injectable()
export class UtilsService {
  // Удаляет пустые элементы из массива
  deleteEmptyElements(line: string[]): string[] {
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

  // Выдает искомую область из файла internal.txt по ключевому слову. Работает для таблиц с данными
  defineWorkingRange(lines: string[], numberOfTrays: number, keyWord: string): string[] {
    let startPosition = 0;
    let workingRange: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(keyWord)) {
        startPosition = i + 3;
      }
    }
    for (let i = startPosition; i < startPosition + numberOfTrays; i++) {
      workingRange.push(lines[i]);
    }

    return workingRange;
  }

  // Удаление из массива определенного элемента
  deleteItem(lines: string[], keyWord: string): string[] {
    const result: string[] = [];
    for (let line of lines) {
      if (line !== keyWord) {
        result.push(line);
      }
    }
    return result;
  }
}
