"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
exports.HELP = [
    {
        command: 'init',
        options: `Interactive ShellProfiler core files initailization\n${chalk.magenta('Options: none')}\n`,
    },
    {
        command: 'stat',
        options: `Checks if everything is ok\n${chalk.magenta('Options: none')}\n`,
    },
    {
        command: 'list',
        options: `Lists all the available aliases or functions.\n${chalk.magenta('Options: [--alias, --func]')}\n`,
    },
    {
        command: 'set',
        options: `Sets the GitHub token or username.\n${chalk.magenta('Options: [--alias, --func, --token:tkn_value, --username:usr_value]')}\n`,
    },
    {
        command: 'del',
        options: `Deletes an alias or a function.\n${chalk.magenta('Options: [--alias, --func]')}\n`
    }
];
//# sourceMappingURL=help.configs.js.map