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
const persisance_service_1 = require("./services/persisance.service");
const persistance_item_type_enum_1 = require("./enums/persistance-item-type.enum");
const item_type_enum_1 = require("./enums/item-type.enum");
const general_configs_1 = require("./configs/general.configs");
const core_commands_enum_1 = require("./enums/core-commands.enum");
class ShellProfiler {
    constructor() {
        this.sys = new system_service_1.SystemService();
        this.github = new github_service_1.GitHubService();
    }
    start() {
        this.cleanupArgs();
        if (this.args.length) {
            this.dispatch();
            return;
        }
        this.sys.help();
    }
    dispatch() {
        if (this.args[0] === core_commands_enum_1.CoreCommands.init) {
            this.handlePreInitCall();
            return;
        }
        if (this.args[0] === core_commands_enum_1.CoreCommands.stat) {
            this.handleStatCall();
            return;
        }
        if (this.args[0] === core_commands_enum_1.CoreCommands.ls) {
            this.handleLsCall();
            return;
        }
        if (this.args[0] === core_commands_enum_1.CoreCommands.set) {
            this.handleSetCall();
            return;
        }
        if (this.args[0] === core_commands_enum_1.CoreCommands.del) {
            this.handleDelCall();
            return;
        }
        this.sys.help();
    }
    handlePreInitCall() {
        if (this.sys.isWindows) {
            ui_service_1.UI.askUserInput(chalk.yellow('WINDOWS DETECTED: Are you part of a Domain? Y/N '), answer => {
                if (answer.trim().toLowerCase() === 'y') {
                    ui_service_1.UI.askUserInput(chalk.yellow('Type your domain user folder name: '), domainUserFolderName => {
                        this.handleRealInitCall(domainUserFolderName);
                    });
                }
                if (answer.trim().toLowerCase() === 'n') {
                    this.handleRealInitCall();
                }
                if (answer.trim().toLowerCase() !== 'n' && answer.trim().toLowerCase() !== 'y') {
                    ui_service_1.UI.error('Invalid answer.');
                    this.dispatch();
                }
            });
        }
        else {
            this.handleRealInitCall();
        }
    }
    handleStatCall() {
        if (this.sys.checkProfilerDataIntegrity()) {
            ui_service_1.UI.success('ShellProfiler is happy! :)');
            return;
        }
        ui_service_1.UI.error('There are issues with your configuration. Run the init script to make ShellProfiler happy again');
    }
    handleLsCall() {
        if (!this.checkExtraOptionsPresence([1])) {
            return;
        }
        const acceptedOptions = [
            { option: '--f' },
            { option: '--a' },
            { option: '--func' },
            { option: '--alias' },
            { option: '--profile' }
        ];
        const extractionResult = this.extractOptionsAndValues(1, acceptedOptions);
        if (!extractionResult) {
            return;
        }
        if (extractionResult.option.indexOf('--alias') !== -1 || extractionResult.option.indexOf('--a') !== -1) {
            this.handleAliasListCall();
        }
        if (extractionResult.option.indexOf('--func') !== -1 || extractionResult.option.indexOf('--f') !== -1) {
            this.handleFunctionListCall();
        }
        if (extractionResult.option.indexOf('--profile') !== -1) {
            this.handleGetProfileNameCall();
        }
    }
    handleSetCall() {
        if (!this.checkExtraOptionsPresence([1])) {
            return;
        }
        const acceptedOptions = [
            { option: '--func' },
            { option: '--f' },
            { option: '--alias' },
            { option: '--a' },
            { option: '--profile' },
            { option: '--token', mustHaveValue: true },
            { option: '--username', mustHaveValue: true }
        ];
        const extractionResult = this.extractOptionsAndValues(1, acceptedOptions);
        if (!extractionResult) {
            return;
        }
        if (extractionResult.option === '--func' || extractionResult.option === '--f') {
            this.handleFunctionSetCall();
        }
        if (extractionResult.option === '--alias' || extractionResult.option === '--a') {
            this.handleAliasSetCall();
        }
        if (extractionResult.option === '--profile') {
            this.handleProfileSetCall();
        }
        if (extractionResult.option.indexOf('--token') !== -1 && extractionResult.value) {
            this.handleTokenSetCall(extractionResult.value);
        }
        if (extractionResult.option.indexOf('--username') !== -1 && extractionResult.value) {
            this.handleUsernameSetCall(extractionResult.value);
        }
    }
    handleDelCall() {
        if (!this.checkExtraOptionsPresence([1])) {
            return;
        }
        const acceptedOptions = [
            { option: '--alias' },
            { option: '--a' },
            { option: '--func' },
            { option: '--f' }
        ];
        const extractionResult = this.extractOptionsAndValues(1, acceptedOptions);
        if (!extractionResult) {
            return;
        }
        if (extractionResult.option.indexOf('--alias') !== -1 || extractionResult.option.indexOf('--a') !== -1) {
            const aliases = persisance_service_1.PersistanceService.getItem(persistance_item_type_enum_1.PersistanceItemType.profilerData).aliases;
            const indexedIds = [];
            if (!aliases.length) {
                ui_service_1.UI.warn('No aliases available.');
                return;
            }
            aliases.forEach((a, i) => indexedIds.push({ key: `${i}) ${a.name}`, value: a.desc }));
            ui_service_1.UI.printKeyValuePairs(indexedIds);
            ui_service_1.UI.askUserInput('Type the number of the alias to delete: ', index => {
                if (!aliases[index] && !this.isMultipleChoice(index)) {
                    ui_service_1.UI.error('You must provide a valid number or a comma separated list of numbers');
                    this.dispatch();
                    return;
                }
                if (this.isMultipleChoice(index)) {
                    let skippedItems = 0;
                    this.extractIdsFromSingleString(index)
                        .forEach(idx => {
                        const _index = parseInt(idx);
                        //  If the index to delete is not valid
                        if (!aliases[_index]) {
                            skippedItems++;
                            return;
                        }
                        this.sys.deleteItem(item_type_enum_1.ItemType.alias, aliases[_index].id);
                    });
                    if (!skippedItems) {
                        ui_service_1.UI.print('Deleting aliases...');
                        return;
                    }
                    ui_service_1.UI.warn(`${skippedItems} aliases where skipped from delete. [INVALID INDEX]`);
                    return;
                }
                this.sys.deleteItem(item_type_enum_1.ItemType.alias, aliases[index].id);
            });
        }
        if (extractionResult.option.indexOf('--func') !== -1 || extractionResult.option.indexOf('--f') !== -1) {
            const functions = persisance_service_1.PersistanceService.getItem(persistance_item_type_enum_1.PersistanceItemType.profilerData).functions;
            const indexedIds = [];
            if (!functions.length) {
                ui_service_1.UI.warn('No functions available.');
                return;
            }
            functions.forEach((f, i) => indexedIds.push({ key: `${i}) ${f.name}`, value: f.desc }));
            ui_service_1.UI.printKeyValuePairs(indexedIds);
            ui_service_1.UI.askUserInput('Type the number of the function to delete: ', index => {
                if (!functions[index]) {
                    ui_service_1.UI.error('You must provide a valid number');
                    this.dispatch();
                    return;
                }
                this.sys.deleteItem(item_type_enum_1.ItemType.function, functions[index].id);
            });
        }
    }
    handleRealInitCall(domainUserFolderName) {
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
                            this.sys.init(token, username, bashrc_path, domainUserFolderName);
                            this.readProfiles(true);
                            return;
                        }
                        if (answer.toLowerCase().trim() === 'n' || (answer.toLowerCase().trim() !== 'y' && answer.toLowerCase().trim() !== 'n')) {
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
    handleFunctionListCall() {
        const list = [];
        const result = this.sys.functions;
        result.forEach(func => {
            list.push({ key: func.name, value: func.desc });
        });
        ui_service_1.UI.printKeyValuePairs(list);
    }
    handleGetProfileNameCall() {
        const result = this.sys.profileName;
        if (!result) {
            ui_service_1.UI.error('No profile name set. Set it with set --profile:name');
            return;
        }
        ui_service_1.UI.print('Profile in use: ' + chalk.yellow(result), true);
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
    handleProfileSetCall() {
        this.readProfiles();
    }
    readProfiles(inInitMode) {
        ui_service_1.UI.print('Reading GitHub stored profiles...');
        this.github
            .listGists()
            .subscribe(res => {
            if (!res.data) {
                ui_service_1.UI.print('No profiles found. Creating a new one...');
                if (inInitMode) {
                    this.createProfile();
                }
            }
            if (res.data) {
                ui_service_1.UI.print('At least one profile has been found.');
                this.selectProfile(res);
            }
        });
    }
    selectProfile(res, inInitMode) {
        console.log();
        res.data.forEach((g, i) => {
            const filename = Object.keys(g.files)[0].split('.')[0];
            ui_service_1.UI.print(`${i}) ${chalk.yellow(filename)}`);
        });
        console.log();
        ui_service_1.UI.askUserInput('Type the number of the profile you want to use or N for a new one: ', choiche => {
            if (!res.data[choiche] && choiche.toLowerCase().trim() !== 'n') {
                ui_service_1.UI.error('Select a valid profile number');
                return;
            }
            if (choiche.toLowerCase().trim() === 'n') {
                this.createProfile();
                return;
            }
            ui_service_1.UI.print('Requesting selected profile content from GitHub...');
            this.loadProfile(res.data[choiche], inInitMode);
        });
    }
    loadProfile(profileData, inInitMode) {
        const profileName = Object.keys(profileData.files)[0].split('.')[0];
        this.github
            .loadGist(profileData.url)
            .subscribe(res => {
            if (!res.data) {
                ui_service_1.UI.error('Error while loading profile');
                ui_service_1.UI.error(res.error);
            }
            ui_service_1.UI.print('Profile content arrived...');
            ui_service_1.UI.print('Updating profile in use...');
            const profilerAuth = persisance_service_1.PersistanceService.getItem(persistance_item_type_enum_1.PersistanceItemType.authData);
            profilerAuth.gistId = JSON.parse(res.data).id;
            persisance_service_1.PersistanceService.setItem(persistance_item_type_enum_1.PersistanceItemType.authData, profilerAuth);
            const profile = JSON.parse(JSON.parse(res.data).files[profileName + general_configs_1.GENERAL.gistFileExt].content);
            persisance_service_1.PersistanceService.setItem(persistance_item_type_enum_1.PersistanceItemType.profilerData, profile);
            ui_service_1.UI.success('Profile in use has been updated to: ' + chalk.yellow(profile.name), true);
            if (inInitMode) {
                ui_service_1.UI.success('ShellProfiler initialization completed!');
            }
        });
    }
    createProfile() {
        ui_service_1.UI.askUserInput('New profile name: ', name => {
            if (!name) {
                name = 'DefaultProfile';
            }
            const profile = persisance_service_1.PersistanceService.getItem(persistance_item_type_enum_1.PersistanceItemType.profilerData);
            //  Set the new name, keep tne paths and reset the arrays
            profile.name = name;
            profile.aliases = [];
            profile.functions = [];
            this.github
                .createGist(name + general_configs_1.GENERAL.gistFileExt, profile)
                .subscribe((res) => {
                if (res.status === 201) {
                    this.sys.setGistId(res.data.id);
                    ui_service_1.UI.success(`Gist created with name: ${name}`);
                    persisance_service_1.PersistanceService.setItem(persistance_item_type_enum_1.PersistanceItemType.profilerData, profile);
                }
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
            return null;
        }
        if (matchingOption && matchingOption.mustHaveValue) {
            const mainArgValue = mainArg.split(':')[1];
            if (!mainArgValue) {
                ui_service_1.UI.error('This command expects a value. Run the command again with its value');
                return null;
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
    cleanupArgs() {
        this.args = process.argv;
        this.args.shift();
        this.args.shift();
    }
    //  TODO move to utils?
    isMultipleChoice(potentialIdsList) {
        return potentialIdsList.split(',').length > 1 ? true : false;
    }
    extractIdsFromSingleString(idsString, splittingChar = ',') {
        return idsString.split(splittingChar);
    }
}
exports.ShellProfiler = ShellProfiler;
const SP = new ShellProfiler();
SP.start();
//# sourceMappingURL=main.js.map