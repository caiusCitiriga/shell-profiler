import * as chalk from 'chalk';

export const HELP = [
    {
        command: 'init',
        options: `Interactive ShellProfiler core files initailization\n${chalk.magenta('Options: none')}\n`,
    },
    {
        command: 'stat',
        options: `Checks if everything is ok\n${chalk.magenta('Options: none')}\n`,
    },
    {
        command: 'ls',
        options: `Lists informations about the given option.\n${chalk.magenta('Options: [--profile, --alias, --func]')}\n`,
    },
    {
        command: 'set',
        options: `Sets the value for the given option.\n${chalk.magenta('Options: [--profile, --alias, --func, --token:tkn_value, --username:usr_value]')}\n`,
    },
    {
        command: 'del',
        options: `Deletes an alias or a function.\n${chalk.magenta('Options: [--alias, --func]')}\n`
    }
]
