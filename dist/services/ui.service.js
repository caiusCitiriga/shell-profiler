"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("rxjs/add/observable/of");
const Subject_1 = require("rxjs/Subject");
const chalk = require("chalk");
const process = require("process");
class UI {
    static get $userInput() {
        return UI._$userInput.asObservable();
    }
    static printKeyValuePairs(set, space_char = ' ') {
        const longestKeyLen = set.reduce((p, c) => p < c.key.length ? c.key.length : false, 0);
        set.forEach(pair => {
            let spaces = space_char;
            for (let i = 0; i < (longestKeyLen - pair.key.length); i++) {
                spaces += space_char;
            }
            console.log(`- ${chalk.yellow(pair.key)}: ${spaces + pair.value}`);
        });
    }
    static askUserInput(question, callback) {
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
    static print(string) {
        console.log(chalk.gray(`${string}`));
    }
    static success(string) {
        console.log(chalk.green(`\u2713 ${string}`));
    }
    static warn(string) {
        console.log(chalk.yellow(`WARN: ${string}`));
    }
    static error(string) {
        console.log(chalk.bgRed.white(`\n ERROR: ${string} `));
    }
    static printTableExperimental(maxLen, currLen) {
        let spaces = '';
        for (let i = 0; i < (maxLen - currLen); i++) {
            spaces += ' ';
        }
        return spaces;
    }
}
UI._$userInput = new Subject_1.Subject();
exports.UI = UI;
