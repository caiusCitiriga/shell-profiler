import "rxjs/add/observable/of";
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import * as chalk from 'chalk';
import * as process from 'process';

export class UI {
    public static printKeyValuePairs(set: { key: string, value: string }[], space_char: string = ' ') {
        let longestKeyLen = set[0].key.length;
        set.forEach(s => longestKeyLen = s.key.length > longestKeyLen ? s.key.length : longestKeyLen);

        set.forEach(pair => {
            let spaces = space_char;
            for (let i = 0; i < (longestKeyLen - pair.key.length); i++) {
                spaces += space_char;
            }

            console.log(`- ${chalk.yellow(pair.key)}: ${spaces + pair.value}`);
        });
    }

    public static askUserInput(question: string, callback?: (data: any) => void, surroundInNewLines?: boolean): void {
        const __this = this;
        const stdin = process.stdin;
        const stdout = process.stdout;

        if (stdin.isPaused()) {
            stdin.resume();
        }

        if (surroundInNewLines) {
            console.log();
        }
        stdout.write(question);
        if (surroundInNewLines) {
            console.log();
        }

        stdin.once('data', (data) => {
            data = data.toString().trim();
            stdin.pause();

            if (callback) {
                callback(data);
            }
        });
    }

    public static print(string: string, surroundInNewlines?: boolean) {
        if (surroundInNewlines) {
            console.log();
        }
        console.log(chalk.gray(`${string}`));
        if (surroundInNewlines) {
            console.log();
        }
    }

    public static success(string: string, surroundInNewlines?: boolean) {
        if (surroundInNewlines) {
            console.log();
        }
        console.log(chalk.green(`\u2713 ${string}`));
        if (surroundInNewlines) {
            console.log();
        }
    }

    public static warn(string: string, surroundInNewlines?: boolean) {
        if (surroundInNewlines) {
            console.log();
        }
        console.log(chalk.yellow(`WARN: ${string}`));
        if (surroundInNewlines) {
            console.log();
        }
    }

    public static error(string: string, surroundInNewlines?: boolean) {
        if (surroundInNewlines) {
            console.log();
        }
        console.log(chalk.red(`ERROR: ${string} \n`));
        if (surroundInNewlines) {
            console.log();
        }
    }

    public static printTableExperimental(maxLen: number, currLen: number) {
        let spaces = '';
        for (let i = 0; i < (maxLen - currLen); i++) {
            spaces += ' ';
        }

        return spaces;
    }
}