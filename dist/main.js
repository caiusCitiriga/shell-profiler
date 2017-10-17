"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("rxjs/add/operator/filter");
const chalk = require("chalk");
const proc = require("process");
const system_service_1 = require("./services/system.service");
const github_service_1 = require("./services/github.service");
const ui_service_1 = require("./services/ui.service");
const DispatcherReturnSet_entity_1 = require("./entities/DispatcherReturnSet.entity");
const UniqueID_service_1 = require("./services/UniqueID.service");
class ShellProfiler {
    constructor() {
        this.sys = new system_service_1.System();
        this.github = new github_service_1.GitHubService();
    }
    start() {
        this.args = proc.argv;
        this.args.shift();
        this.args.shift();
        if (this.args.length) {
            this.dispatch();
            return;
        }
        ui_service_1.UI.print('Here\'s a list of all available commands and their usage or options');
        this.sys.help();
    }
    dispatch() {
        let acceptedOptions;
        let extractionResult;
        switch (this.args[0]) {
            case 'tkn':
                const github = new github_service_1.GitHubService();
                let tkn = "";
                github.token.split('-').forEach(char => tkn += char);
                ui_service_1.UI.print(tkn);
                break;
            case 'set':
                if (!this.checkExtraOptionsPresence([1])) {
                    return;
                }
                acceptedOptions = [{ option: '--token', mustHaveValue: true }, { option: '--username', mustHaveValue: true }];
                extractionResult = this.extractOptionsAndValues(1, acceptedOptions);
                if (extractionResult.option.indexOf('--token') !== -1 && extractionResult.value) {
                    this.sys.setGithubToken(extractionResult.value);
                    ui_service_1.UI.success(`GitHub access token successfully set to "${extractionResult.value}"`);
                }
                if (extractionResult.option.indexOf('--username') !== -1 && extractionResult.value) {
                    this.sys.setGithubUsername(extractionResult.value);
                    ui_service_1.UI.success(`Username successfully set to "${extractionResult.value}"`);
                }
                break;
            case 'new':
                acceptedOptions = [{ option: '--alias' }, { option: '--func' }];
                extractionResult = this.extractOptionsAndValues(1, acceptedOptions);
                if (extractionResult.option === '--alias') {
                    ui_service_1.UI.askUserInput(chalk.green('Alias name: '), (alias) => {
                        ui_service_1.UI.askUserInput(chalk.green('Alias body: '), (data) => {
                            const aliasName = alias;
                            const aliasBody = data;
                            this.sys.upsertAlias({ id: UniqueID_service_1.UniqueIdUtility.generateId(), name: aliasName, command: aliasBody });
                        });
                    });
                }
                if (extractionResult.option === '--func') {
                    ui_service_1.UI.askUserInput(chalk.green('Function name: '), (func) => {
                        ui_service_1.UI.askUserInput(chalk.green('Function body: '), (data) => {
                            const funcName = func;
                            const funcBody = `function ${funcName}(){${data}}`;
                            this.sys.upsertFunc({ id: UniqueID_service_1.UniqueIdUtility.generateId(), name: funcName, command: funcBody });
                        });
                    });
                }
                break;
            case 'delete':
                ui_service_1.UI.print(!!this.checkExtraOptionsPresence([1]) ? chalk.green('OK') : chalk.red('MISSING ARG'));
                break;
            case 'edit':
                ui_service_1.UI.print(!!this.checkExtraOptionsPresence([1]) ? chalk.green('OK') : chalk.red('MISSING ARG'));
                break;
            default:
                //  Look for an available alias or function    
                ui_service_1.UI.warn('No command exists with that name');
                break;
        }
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
