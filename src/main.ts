import 'rxjs/add/operator/filter';

import * as chalk from 'chalk';
import * as proc from 'process';
import * as cp from 'child_process';

import { System } from './services/system.service';
import { GitHubService } from './services/github.service';
import { AcceptedOption } from './entities/AcceptedOption.entity';
import { UI } from './services/ui.service';
import { DispatcherReturnSet } from './entities/DispatcherReturnSet.entity';
import { UniqueIdUtility } from './services/UniqueID.service';

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

        UI.print('Here\'s a list of all available commands and their usage or options');
        this.sys.help();
    }

    private dispatch() {
        let acceptedOptions: AcceptedOption[];
        let extractionResult: { option: string, value?: string };

        switch (this.args[0]) {
            case 'tkn':
                const github = new GitHubService();
                let tkn = ""
                github.token.split('-').forEach(char => tkn += char);
                UI.print(tkn);
                break;

            case 'set':
                if (!this.checkExtraOptionsPresence([1])) {
                    return;
                }

                acceptedOptions = [{ option: '--token', mustHaveValue: true }, { option: '--username', mustHaveValue: true }];
                extractionResult = this.extractOptionsAndValues(1, acceptedOptions);

                if (extractionResult.option.indexOf('--token') !== -1 && extractionResult.value) {
                    this.sys.setGithubToken(extractionResult.value);
                    UI.success(`GitHub access token successfully set to "${extractionResult.value}"`);
                }

                if (extractionResult.option.indexOf('--username') !== -1 && extractionResult.value) {
                    this.sys.setGithubUsername(extractionResult.value);
                    UI.success(`Username successfully set to "${extractionResult.value}"`);
                }
                break;

            case 'new':
                acceptedOptions = [{ option: '--alias' }, { option: '--func' }];
                extractionResult = this.extractOptionsAndValues(1, acceptedOptions);
                if (extractionResult.option === '--alias') {
                    UI.askUserInput(chalk.green('Alias name: '), (alias) => {
                        UI.askUserInput(chalk.green('Alias body: '), (data) => {
                            const aliasName = alias;
                            const aliasBody = data;
                            this.sys.upsertAlias({ id: UniqueIdUtility.generateId(), name: aliasName, command: aliasBody });
                        });
                    });
                }

                if (extractionResult.option === '--func') {
                    UI.askUserInput(chalk.green('Function name: '), (func) => {
                        UI.askUserInput(chalk.green('Function body: '), (data) => {
                            const funcName = func;
                            const funcBody = `function ${funcName}(){${data}}`;
                            this.sys.upsertFunc({ id: UniqueIdUtility.generateId(), name: funcName, command: funcBody });
                        });
                    });
                }
                break;

            case 'delete':
                UI.print(!!this.checkExtraOptionsPresence([1]) ? chalk.green('OK') : chalk.red('MISSING ARG'));
                break;

            case 'edit':
                UI.print(!!this.checkExtraOptionsPresence([1]) ? chalk.green('OK') : chalk.red('MISSING ARG'));
                break;

            default:
                //  Look for an available alias or function    
                UI.warn('No command exists with that name');
                break;
        }
    }

    private checkExtraOptionsPresence(howMany: number[], warnInConsole = true) {
        let allArgsPresent = true;
        howMany.forEach(index => {
            allArgsPresent = !!this.args[index];
        });

        if (!allArgsPresent && warnInConsole) {
            UI.error('Command is missing a/some option/s. Check the correct syntax');
        }

        return allArgsPresent;
    }

    private extractOptionsAndValues(argToWorkOn: number, acceptedOptions: AcceptedOption[], warnInConsole = true): DispatcherReturnSet {
        const mainArg = this.args[argToWorkOn];
        const returnSet = new DispatcherReturnSet();
        let matchingOption = acceptedOptions.find(opt => mainArg.indexOf(opt.option) !== -1 ? true : false);

        if (!matchingOption && warnInConsole) {
            UI.error('No matching options found for the given command');
            return returnSet;
        }

        if (matchingOption && matchingOption.mustHaveValue) {
            const mainArgValue = mainArg.split(':')[1];
            if (!mainArgValue) {
                UI.error('This command expects a value. Run the command again with its value');
            } else {
                returnSet.option = mainArg;
                returnSet.value = mainArgValue;
            }
        }

        if (matchingOption && !matchingOption.mustHaveValue) {
            returnSet.option = matchingOption.option;
        }

        return returnSet;
    }
}

const SP = new ShellProfiler();
SP.start();