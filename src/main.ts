import * as chalk from 'chalk';
import * as proc from 'process';
import * as cp from 'child_process';

import { System } from './services/system.service';
import { GitHubService } from './services/github.service';
import { AcceptedOption } from './entities/AcceptedOption.entity';

export class ShellProfiler {
    private args: string[];
    private sys: System;
    private github: GitHubService;

    public constructor() {
        this.sys = new System();
        this.github = new GitHubService();
    }

    public start() {
        this.args = proc.argv;
        this.args.shift();
        this.args.shift();

        if (this.args.length) {
            this.dispatch();
            return;
        }

        this.sys.help();
    }

    private dispatch() {
        switch (this.args[0]) {
            case 'set':
                if (!this.checkArgsPresence([1])) {
                    return;
                }

                const acceptedOptions = [
                    { option: '--token', mustHaveValue: true },
                    { option: '--username', mustHaveValue: false }
                ];

                if (!this.extractOptionsAndValues(1, acceptedOptions).length) {
                    return;
                }

                console.log('Command accepted... continuing');
                break;
            case 'new':
                console.log(!!this.checkArgsPresence([1]) ? chalk.green('OK') : chalk.red('MISSING ARG'));
                break;
            case 'delete':
                console.log(!!this.checkArgsPresence([1]) ? chalk.green('OK') : chalk.red('MISSING ARG'));
                break;
            case 'edit':
                console.log(!!this.checkArgsPresence([1]) ? chalk.green('OK') : chalk.red('MISSING ARG'));
                break;
            default:
                //  Look for an available alias or function    
                break;
        }
    }

    private checkArgsPresence(howMany: number[], warnInConsole = true) {
        let allArgsPresent = true;
        howMany.forEach(index => {
            allArgsPresent = !!this.args[index];
        });

        if (!allArgsPresent && warnInConsole) {
            console.log(chalk.red('Command is missing a/some option/s. Check the correct syntax'));
        }

        return allArgsPresent;
    }

    private extractOptionsAndValues(argToWorkOn: number, acceptedOptions: AcceptedOption[], warnInConsole = true): any[] {
        let noMatches = true;
        const arg = this.args[argToWorkOn];
        const returnedSet: any = [];
        acceptedOptions.forEach(acceptedOption => {
            if (acceptedOption.mustHaveValue) {
                const passedOption = arg.split(':')[0];
                const value = arg.split(':')[1];

                if (value && value.length && passedOption === acceptedOption.option) {
                    console.log('Found a matching option with value needed');
                    console.log('Option: ' + passedOption);
                    console.log('Value: ' + value);
                    returnedSet.push({ option: passedOption, value: value });

                    noMatches = false;
                }
            } else {
                if (arg === acceptedOption.option) {
                    console.log('Found a matching option without a value needed');
                    console.log('Option: ' + arg);
                    returnedSet.push({ option: arg });
                    noMatches = false;
                }
            }
        });

        if (noMatches && warnInConsole) {
            console.log(chalk.red('No matches found for the given command. Check your syntax and any required values'));
            return [];
        }

        return returnedSet;
    }
}

const SP = new ShellProfiler();
SP.start();