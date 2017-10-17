import "rxjs/add/observable/of";
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import * as chalk from 'chalk';
import * as process from 'process';
import * as readline from 'readline';

export class UI {
    private static _$userInput: Subject<string | null> = new Subject();

    public static get $userInput(): Observable<string | null> {
        return UI._$userInput.asObservable();
    }

    public static printKeyValuePairs(set: { key: string, value: string }[], space_char: string = ' ') {
        const longestKeyLen = <number>set.reduce((p, c) => p < c.key.length ? c.key.length : false, 0);
        set.forEach(pair => {
            let spaces = space_char;
            for (let i = 0; i < (longestKeyLen - pair.key.length); i++) {
                spaces += space_char;
            }

            console.log(`- ${chalk.yellow(pair.key)}: ${spaces + pair.value}`);
        });
    }

    public static askUserInput(question: string, callback?: (data: any) => void): void {
        const __this = this;
        const stdin = process.stdin;
        const stdout = process.stdout;

        stdin.resume();
        stdout.write(question);

        stdin.once('data', (data) => {
            data = data.toString().trim();
            stdin.pause();

            __this._$userInput.next(data);

            if (callback) {
                callback(data);
            }
        });
    }

    public static print(string: string) {
        console.log(chalk.gray(`${string}`));
    }

    public static success(string: string) {
        console.log(chalk.green(`\u2713 ${string}`));
    }

    public static warn(string: string) {
        console.log(chalk.yellow(`WARN: ${string}`));
    }

    public static error(string: string) {
        console.log(chalk.bgRed.white(`\n ERROR: ${string} `));
    }

    public static printTableExperimental(maxLen: number, currLen: number) {
        let spaces = '';
        for (let i = 0; i < (maxLen - currLen); i++) {
            spaces += ' ';
        }

        return spaces;
    }
}