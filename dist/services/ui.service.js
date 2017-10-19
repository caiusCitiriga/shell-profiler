"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("rxjs/add/observable/of");
const BehaviorSubject_1 = require("rxjs/BehaviorSubject");
const chalk = require("chalk");
const process = require("process");
const readline = require("readline");
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
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(question, answer => {
            rl.close();
        });
        // const __this = this;
        // const stdin = process.stdin;
        // const stdout = process.stdout;
        // if (stdin.isPaused()) {
        //     stdin.resume();
        // }
        // stdout.write(question);
        // stdin.once('data', (data) => {
        //     data = data.toString().trim();
        //     stdin.pause();
        //     __this._$userInput.next(data);
        //     if (callback) {
        //         callback(data);
        //     }
        // });
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
        console.log(chalk.red(`ERROR: ${string} \n`));
    }
    static printTableExperimental(maxLen, currLen) {
        let spaces = '';
        for (let i = 0; i < (maxLen - currLen); i++) {
            spaces += ' ';
        }
        return spaces;
    }
}
UI._$userInput = new BehaviorSubject_1.BehaviorSubject(null);
exports.UI = UI;
//# sourceMappingURL=ui.service.js.map