"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("rxjs/add/observable/of");
const chalk = require("chalk");
const process = require("process");
class UI {
    static printKeyValuePairs(set, space_char = ' ') {
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
    static askUserInput(question, callback, surroundInNewLines) {
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
    static print(string, surroundInNewlines) {
        if (surroundInNewlines) {
            console.log();
        }
        console.log(chalk.gray(`${string}`));
        if (surroundInNewlines) {
            console.log();
        }
    }
    static success(string, surroundInNewlines) {
        if (surroundInNewlines) {
            console.log();
        }
        console.log(chalk.green(`\u2713 ${string}`));
        if (surroundInNewlines) {
            console.log();
        }
    }
    static warn(string, surroundInNewlines) {
        if (surroundInNewlines) {
            console.log();
        }
        console.log(chalk.yellow(`WARN: ${string}`));
        if (surroundInNewlines) {
            console.log();
        }
    }
    static error(string, surroundInNewlines) {
        if (surroundInNewlines) {
            console.log();
        }
        console.log(chalk.red(`ERROR: ${string} \n`));
        if (surroundInNewlines) {
            console.log();
        }
    }
    static printTableExperimental(maxLen, currLen) {
        let spaces = '';
        for (let i = 0; i < (maxLen - currLen); i++) {
            spaces += ' ';
        }
        return spaces;
    }
}
exports.UI = UI;
//# sourceMappingURL=ui.service.js.map