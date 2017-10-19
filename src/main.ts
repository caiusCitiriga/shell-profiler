#! /usr/bin/env node

import 'rxjs/add/operator/filter';

import * as os from 'os';
import * as chalk from 'chalk';
import * as process from 'process';
import * as child_process from 'child_process';

import { AcceptedOption } from './entities/AcceptedOption.entity';
import { DispatcherReturnSet } from './entities/DispatcherReturnSet.entity';

import { UI } from './services/ui.service';
import { SystemService } from './services/system.service';
import { GitHubService } from './services/github.service';
import { UniqueIdUtility } from './services/UniqueID.service';
import { PersistanceService } from './services/persisance.service';
import { ProfilerData } from './entities/ProfilerData.entity';
import { PersistanceItemType } from './enums/persistance-item-type.enum';
import { ItemType } from './enums/item-type.enum';

export class ShellProfiler {
    private args: string[];
    private sys: SystemService;
    private github: GitHubService;

    public constructor() {
        this.sys = new SystemService();
        this.github = new GitHubService();
    }

    public start() {
        this.args = process.argv;
        this.args.shift();
        this.args.shift();

        if (this.args.length) {
            this.dispatch();
            return;
        }

        this.sys.help();
    }

    private dispatch() {
        let acceptedOptions: AcceptedOption[];
        let extractionResult: { option: string, value?: string } | null;

        switch (this.args[0]) {
            //  TODO: Remove in production
            case 'tkn':
                const github = new GitHubService();
                let tkn = ""
                github.token.split('-').forEach(char => tkn += char);
                UI.print(tkn);
                break;

            case 'init':
                if (this.sys.isWindows) {
                    UI.askUserInput(chalk.yellow('WINDOWS DETECTED: Are you part of a Domain? Y/N '), answer => {
                        if (answer.trim().toLowerCase() === 'y') {
                            UI.askUserInput(chalk.yellow('Type your domain user folder name: '), domainUserFolderName => {
                                this.handleInitCall(domainUserFolderName);
                            });
                        }

                        if (answer.trim().toLowerCase() === 'n') {
                            this.handleInitCall();
                        }

                        if (answer.trim().toLowerCase() !== 'n' && answer.trim().toLowerCase() !== 'y') {
                            UI.error('Invalid answer.');
                            this.dispatch();
                        }
                    });
                } else {
                    this.handleInitCall();
                }
                break;

            case 'stat':
                if (this.sys.checkProfilerDataIntegrity()) {
                    UI.success('ShellProfiler is happy! :)');
                    return;
                }

                UI.error('There are issues with your configuration. Run the init script to make ShellProfiler happy again');
                break;

            case 'list':
                if (!this.checkExtraOptionsPresence([1])) {
                    return;
                }

                acceptedOptions = [{ option: '--alias' }, { option: '--func' }];
                extractionResult = this.extractOptionsAndValues(1, acceptedOptions);
                if (!extractionResult) {
                    return;
                }
                if (extractionResult.option.indexOf('--alias') !== -1) {
                    this.handleAliasListCall();
                }
                if (extractionResult.option.indexOf('--func') !== -1) {
                    this.handleFunctionListCall();
                }
                break;

            case 'set':
                if (!this.checkExtraOptionsPresence([1])) {
                    return;
                }

                acceptedOptions = [
                    { option: '--alias' },
                    { option: '--func' },
                    { option: '--token', mustHaveValue: true },
                    { option: '--username', mustHaveValue: true }
                ];

                extractionResult = this.extractOptionsAndValues(1, acceptedOptions);
                if (!extractionResult) {
                    return;
                }
                if (extractionResult.option.indexOf('--token') !== -1 && extractionResult.value) {
                    this.handleTokenSetCall(extractionResult.value);
                }
                if (extractionResult.option.indexOf('--username') !== -1 && extractionResult.value) {
                    this.handleUsernameSetCall(extractionResult.value);
                }
                if (extractionResult.option === '--alias') {
                    this.handleAliasSetCall();
                }
                if (extractionResult.option === '--func') {
                    this.handleFunctionSetCall();
                }
                break;

            case 'del':
                if (!this.checkExtraOptionsPresence([1])) {
                    return;
                }

                acceptedOptions = [{ option: '--alias' }, { option: '--func' }];

                extractionResult = this.extractOptionsAndValues(1, acceptedOptions);
                if (!extractionResult) {
                    return;
                }
                if (extractionResult.option.indexOf('--alias') !== -1) {
                    const aliases = (<ProfilerData>PersistanceService.getItem(PersistanceItemType.profilerData)).aliases;
                    const indexedIds: { key: string, value: string }[] = [];

                    aliases.forEach((a, i) => indexedIds.push({ key: `${i}) ${a.name}`, value: a.desc }));
                    UI.printKeyValuePairs(indexedIds);
                    UI.askUserInput('Type the number of the alias to delete: ', index => {
                        if (!aliases[index]) {
                            UI.error('You must provide a valid number');
                            this.dispatch();
                            return;
                        }

                        this.sys.deleteItem(ItemType.alias, aliases[index].id);
                    });
                }
                if (extractionResult.option.indexOf('--func') !== -1) {
                    const functions = (<ProfilerData>PersistanceService.getItem(PersistanceItemType.profilerData)).functions;
                    const indexedIds: { key: string, value: string }[] = [];

                    functions.forEach((f, i) => indexedIds.push({ key: `${i}) ${f.name}`, value: f.desc }));
                    UI.printKeyValuePairs(indexedIds);
                    UI.askUserInput('Type the number of the function to delete: ', index => {
                        if (!functions[index]) {
                            UI.error('You must provide a valid number');
                            this.dispatch();
                            return;
                        }

                        this.sys.deleteItem(ItemType.function, functions[index].id);
                    });
                }
                break;

            case 'help':
                this.sys.help();
                break;

            default:
                //  Look for an available alias or function    
                UI.warn('No command exists with that name');
                break;
        }
    }

    private handleInitCall(domainUserFolderName?: string) {
        UI.askUserInput(chalk.green('GitHub authorization token: '), token => {
            UI.askUserInput(chalk.green('GitHub username: '), username => {
                UI.askUserInput(chalk.green('Your bashrc file absolute path: '), bashrc_path => {
                    UI.printKeyValuePairs([
                        { key: 'Token', value: token },
                        { key: 'Username', value: username },
                        { key: 'Bashrc path', value: bashrc_path }
                    ]);
                    UI.askUserInput(chalk.yellow('Do you confirm?') + ' Y/N ', (answer: string) => {
                        if (answer.toLowerCase().trim() === 'y' || answer.toLowerCase().trim() === '') {
                            this.sys.init(token, username, bashrc_path, domainUserFolderName);
                            return;
                        }

                        if (answer.toLowerCase().trim() === 'n' || (answer.toLowerCase().trim() !== 'y' && answer.toLowerCase().trim() !== 'n')) {
                            this.args[0] = 'init';
                            this.dispatch();
                        }
                    })
                });
            });
        });
    }

    private handleAliasListCall() {
        const list: { key: string, value: string }[] = [];
        const result = this.sys.aliases;
        result.forEach(als => {
            list.push({ key: als.name, value: als.desc });
        });

        UI.printKeyValuePairs(list);
    }

    private handleFunctionListCall() {
        const list: { key: string, value: string }[] = [];
        const result = this.sys.functions;
        result.forEach(func => {
            list.push({ key: func.name, value: func.desc });
        });

        UI.printKeyValuePairs(list);
    }

    private handleTokenSetCall(extractionResultValue: string) {
        this.sys.setGithubToken(extractionResultValue);
        UI.success(`GitHub access token successfully set to "${extractionResultValue}"`);
    }

    private handleUsernameSetCall(extractionResultValue: string) {
        this.sys.setGithubUsername(extractionResultValue);
        UI.success(`Username successfully set to "${extractionResultValue}"`);
    }

    private handleAliasSetCall() {
        UI.askUserInput(chalk.green('Alias name: '), aliasName => {
            UI.askUserInput(chalk.green('Alias description: '), description => {
                UI.askUserInput(chalk.green('Alias body: '), data => {
                    const aliasBody = `alias ${aliasName}="${data}"`;
                    this.sys.upsertAlias({ id: UniqueIdUtility.generateId(), name: aliasName, desc: description, command: aliasBody });
                });
            });
        });
    }

    private handleFunctionSetCall() {
        UI.askUserInput(chalk.green('Function name: '), (funcName) => {
            UI.askUserInput(chalk.green('Function description: '), description => {
                UI.askUserInput(chalk.green('Function body: '), (data) => {
                    const funcBody = `function ${funcName}(){\n\t${data}\n}`;
                    this.sys.upsertFunc({ id: UniqueIdUtility.generateId(), name: funcName, desc: description, command: funcBody });
                });
            });
        });
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

    private extractOptionsAndValues(argToWorkOn: number, acceptedOptions: AcceptedOption[], warnInConsole = true): DispatcherReturnSet | null {
        const mainArg = this.args[argToWorkOn];
        const returnSet = new DispatcherReturnSet();
        let matchingOption = acceptedOptions.find(opt => mainArg.indexOf(opt.option) !== -1 ? true : false);

        if (!matchingOption && warnInConsole) {
            UI.error('No matching options found for the given command');
            return null;
        }

        if (matchingOption && matchingOption.mustHaveValue) {
            const mainArgValue = mainArg.split(':')[1];
            if (!mainArgValue) {
                UI.error('This command expects a value. Run the command again with its value');
                return null;
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