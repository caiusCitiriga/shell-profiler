#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("rxjs/add/operator/filter");
const chalk = require("chalk");
const process = require("process");
const DispatcherReturnSet_entity_1 = require("./entities/DispatcherReturnSet.entity");
const ui_service_1 = require("./services/ui.service");
const system_service_1 = require("./services/system.service");
const github_service_1 = require("./services/github.service");
const UniqueID_service_1 = require("./services/UniqueID.service");
class ShellProfiler {
    constructor() {
        this.sys = new system_service_1.SystemService();
        this.github = new github_service_1.GitHubService();
    }
    start() {
        this.args = process.argv;
        this.args.shift();
        this.args.shift();
        if (this.args.length) {
            this.dispatch();
            return;
        }
        this.sys.help();
    }
    dispatch() {
        let acceptedOptions;
        let extractionResult;
        switch (this.args[0]) {
            //  TODO: Remove in production
            case 'tkn':
                const github = new github_service_1.GitHubService();
                let tkn = "";
                github.token.split('-').forEach(char => tkn += char);
                ui_service_1.UI.print(tkn);
                break;
            case 'init':
                this.handleInitCall();
                break;
            case 'stat':
                if (this.sys.checkProfilerDataIntegrity()) {
                    ui_service_1.UI.success('ShellProfiler is happy! :)');
                    return;
                }
                ui_service_1.UI.error('There are issues with your configuration. Run the init script to make ShellProfiler happy again');
                break;
            case 'list':
                if (!this.checkExtraOptionsPresence([1])) {
                    return;
                }
                acceptedOptions = [{ option: '--alias' }, { option: '--func' }];
                extractionResult = this.extractOptionsAndValues(1, acceptedOptions);
                if (extractionResult.option.indexOf('--alias') !== -1) {
                    this.handleAliasListCall();
                }
                if (extractionResult.option.indexOf('--func') !== -1) {
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
            case 'delete':
                ui_service_1.UI.print(!!this.checkExtraOptionsPresence([1]) ? chalk.green('OK') : chalk.red('MISSING ARG'));
                break;
            case 'help':
                ui_service_1.UI.print(!!this.checkExtraOptionsPresence([1]) ? chalk.green('OK') : chalk.red('MISSING ARG'));
                break;
            default:
                //  Look for an available alias or function    
                ui_service_1.UI.warn('No command exists with that name');
                break;
        }
    }
    handleInitCall() {
        ui_service_1.UI.askUserInput(chalk.green('GitHub authorization token: '), token => {
            ui_service_1.UI.askUserInput(chalk.green('GitHub username: '), username => {
                ui_service_1.UI.askUserInput(chalk.green('Your bashrc file absolute path: '), bashrc_path => {
                    ui_service_1.UI.printKeyValuePairs([
                        { key: 'Token', value: token },
                        { key: 'Username', value: username },
                        { key: 'Bashrc path', value: bashrc_path }
                    ]);
                    ui_service_1.UI.askUserInput(chalk.yellow('Do you confirm?') + ' Y/N ', (answer) => {
                        if (answer.toLowerCase().trim() === 'y' || answer.toLowerCase().trim() === '') {
                            this.sys.init(token, username, bashrc_path);
                            return;
                        }
                        if (answer.toLowerCase().trim() === 'n' || (answer.toLowerCase().trim() !== 'y' && answer.toLowerCase().trim() !== 'n')) {
                            this.args[0] = 'init';
                            this.dispatch();
                        }
                    });
                });
            });
        });
    }
    handleAliasListCall() {
        const list = [];
        const result = this.sys.aliases;
        result.forEach(als => {
            list.push({ key: als.name, value: als.desc });
        });
        ui_service_1.UI.printKeyValuePairs(list);
    }
    handleTokenSetCall(extractionResultValue) {
        this.sys.setGithubToken(extractionResultValue);
        ui_service_1.UI.success(`GitHub access token successfully set to "${extractionResultValue}"`);
    }
    handleUsernameSetCall(extractionResultValue) {
        this.sys.setGithubUsername(extractionResultValue);
        ui_service_1.UI.success(`Username successfully set to "${extractionResultValue}"`);
    }
    handleAliasSetCall() {
        ui_service_1.UI.askUserInput(chalk.green('Alias name: '), aliasName => {
            ui_service_1.UI.askUserInput(chalk.green('Alias description: '), description => {
                ui_service_1.UI.askUserInput(chalk.green('Alias body: '), data => {
                    const aliasBody = `alias ${aliasName}="${data}"`;
                    this.sys.upsertAlias({ id: UniqueID_service_1.UniqueIdUtility.generateId(), name: aliasName, desc: description, command: aliasBody });
                });
            });
        });
    }
    handleFunctionSetCall() {
        ui_service_1.UI.askUserInput(chalk.green('Function name: '), (funcName) => {
            ui_service_1.UI.askUserInput(chalk.green('Function description: '), description => {
                ui_service_1.UI.askUserInput(chalk.green('Function body: '), (data) => {
                    const funcBody = `function ${funcName}(){\n\t${data}\n}`;
                    this.sys.upsertFunc({ id: UniqueID_service_1.UniqueIdUtility.generateId(), name: funcName, desc: description, command: funcBody });
                });
            });
        });
    }
    checkExtraOptionsPresence(howMany, warnInConsole = true) {
        let allArgsPresent = true;
        howMany.forEach(index => {
            allArgsPresent = !!this.args[index];
        });
        if (!allArgsPresent && warnInConsole) {
            ui_service_1.UI.error('Command is missing a/some option/s. Check the correct syntax');
        }
        return allArgsPresent;
    }
    extractOptionsAndValues(argToWorkOn, acceptedOptions, warnInConsole = true) {
        const mainArg = this.args[argToWorkOn];
        const returnSet = new DispatcherReturnSet_entity_1.DispatcherReturnSet();
        let matchingOption = acceptedOptions.find(opt => mainArg.indexOf(opt.option) !== -1 ? true : false);
        if (!matchingOption && warnInConsole) {
            ui_service_1.UI.error('No matching options found for the given command');
            return returnSet;
        }
        if (matchingOption && matchingOption.mustHaveValue) {
            const mainArgValue = mainArg.split(':')[1];
            if (!mainArgValue) {
                ui_service_1.UI.error('This command expects a value. Run the command again with its value');
            }
            else {
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
exports.ShellProfiler = ShellProfiler;
const SP = new ShellProfiler();
SP.start();
//# sourceMappingURL=main.js.map