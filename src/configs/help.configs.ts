import * as chalk from 'chalk';

export const HELP = [
    {
        command: 'init',
        options: `Interactive ShellProfiler core files initailization\n${chalk.green('Options: none')}\n`,
    },
    {
        command: 'stat',
        options: `Checks if everything is ok\n${chalk.green('Options: none')}\n`,
    },
    {
        command: 'ls',
        options: `Lists informations about the given option.\n${chalk.green('Options: [--profile, (--alias, --a), (--func, --f)]')}\n`,
    },
    {
        command: 'set',
        options: `Sets the value for the given option.\n${chalk.green('Options: [--profile, (--alias, --a), (--func, --f), --token:tkn_value, --username:usr_value]')}\n`,
    },
    {
        command: 'del',
        options: `Deletes an alias or a function.\n${chalk.green('Options: [(--alias, --a), (--func, --f)]')}\n`
    }
]
