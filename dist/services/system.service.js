"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const process = require("process");
const help_configs_1 = require("../configs/help.configs");
const general_configs_1 = require("../configs/general.configs");
const item_type_enum_1 = require("../enums/item-type.enum");
const ProfilerData_entity_1 = require("../entities/ProfilerData.entity");
const ProfilerAtuh_entity_1 = require("../entities/ProfilerAtuh.entity");
const ui_service_1 = require("./ui.service");
const rmdir_recursive_service_1 = require("./rmdir-recursive.service");
const persisance_service_1 = require("./persisance.service");
const persistance_item_type_enum_1 = require("../enums/persistance-item-type.enum");
class SystemService {
    get aliases() {
        const result = persisance_service_1.PersistanceService.getItem(persistance_item_type_enum_1.PersistanceItemType.profilerData);
        return !result.aliases ? [] : result.aliases.sort((a, b) => a.name.length - b.name.length);
    }
    get functions() {
        const result = persisance_service_1.PersistanceService.getItem(persistance_item_type_enum_1.PersistanceItemType.profilerData);
        return !result.functions ? [] : result.functions.sort((a, b) => a.name.length - b.name.length);
    }
    help() {
        const set = [];
        help_configs_1.HELP.forEach(h => {
            set.push({ key: h.command, value: h.options });
        });
        ui_service_1.UI.printKeyValuePairs(set);
    }
    init(token, username, usrBashrcPath) {
        if (!fs.existsSync(usrBashrcPath)) {
            console.log();
            ui_service_1.UI.error('The path provided for the bashrc file is not valid.');
            return;
        }
        process.chdir(os.homedir());
        if (fs.existsSync(general_configs_1.GENERAL.profilerDataDirectory)) {
            rmdir_recursive_service_1.RmdirRecursive.rmdirRec(general_configs_1.GENERAL.profilerDataDirectory);
        }
        this.initializeCoreFiles();
        this.setGithubToken(token);
        this.setGithubUsername(username);
        this.setUserBashrcFilePath(usrBashrcPath);
        //  Set the sourcing of the shell_profiler bashrc on the main bashrc file 
        let source_path = '';
        let usrBashrcFile = fs.readFileSync(usrBashrcPath, { encoding: 'UTF-8' }).toString();
        if (os.platform() === 'win32') {
            console.log(chalk.yellow('Converting path to UNIX-like for sourcing.'));
            const username_folder = os.userInfo().username;
            source_path = `/c/Users/${username_folder}/${general_configs_1.GENERAL.profilerDataDirectory}/${general_configs_1.GENERAL.profilerBashFile}`;
        }
        else {
            source_path = os.homedir() + path.sep + general_configs_1.GENERAL.profilerDataDirectory + path.sep + general_configs_1.GENERAL.profilerBashFile;
        }
        usrBashrcFile += `\n#ShellProfiler source. Do not remove this.\nsource ${source_path}`;
        fs.writeFileSync(usrBashrcPath, usrBashrcFile, { encoding: 'UTF-8' });
        ui_service_1.UI.success('ShellProfiler has been successfully initialized!');
    }
    setGithubToken(token) {
        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }
        const auth = persisance_service_1.PersistanceService.getItem(persistance_item_type_enum_1.PersistanceItemType.authData);
        auth.githubToken = token;
        persisance_service_1.PersistanceService.setItem(persistance_item_type_enum_1.PersistanceItemType.authData, auth);
    }
    setGithubUsername(username) {
        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }
        const auth = persisance_service_1.PersistanceService.getItem(persistance_item_type_enum_1.PersistanceItemType.authData);
        auth.githubUsername = username;
        persisance_service_1.PersistanceService.setItem(persistance_item_type_enum_1.PersistanceItemType.authData, auth);
    }
    setUserBashrcFilePath(filePath) {
        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }
        process.chdir(os.homedir() + path.sep + general_configs_1.GENERAL.profilerDataDirectory);
        const profilerData = JSON.parse(fs.readFileSync(general_configs_1.GENERAL.profilerDataFile, { encoding: 'UTF-8' }));
        profilerData.userBashrcFilePath = filePath;
        persisance_service_1.PersistanceService.setItem(persistance_item_type_enum_1.PersistanceItemType.profilerData, profilerData);
    }
    upsertAlias(alias) {
        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }
        let updated = false;
        const profilerData = persisance_service_1.PersistanceService.getItem(persistance_item_type_enum_1.PersistanceItemType.profilerData);
        if (!!profilerData && !profilerData.aliases) {
            profilerData.aliases = [];
        }
        if (!!profilerData.aliases.find(a => a.name === alias.name.trim().toLowerCase())) {
            profilerData.aliases.forEach((a, i) => {
                if (a.name === alias.name.toLowerCase().trim()) {
                    profilerData.aliases[i].command = alias.command;
                    updated = true;
                }
            });
        }
        else {
            profilerData.aliases.push(alias);
        }
        persisance_service_1.PersistanceService.setItem(persistance_item_type_enum_1.PersistanceItemType.profilerData, profilerData);
        console.log();
        ui_service_1.UI.success(updated ? 'Alias updated successfully!' : 'Alias added successfully!');
        ui_service_1.UI.warn('Remember that you have to restart your shell in order to use this alias');
    }
    upsertFunc(func) {
        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }
        let updated = false;
        const profilerData = persisance_service_1.PersistanceService.getItem(persistance_item_type_enum_1.PersistanceItemType.profilerData);
        if (!!profilerData && !profilerData.functions) {
            profilerData.functions = [];
        }
        if (!!profilerData.functions.find(f => f.name === func.name.trim().toLowerCase())) {
            profilerData.functions.forEach((f, i) => {
                if (f.name === func.name.toLowerCase().trim()) {
                    profilerData.functions[i].command = func.command;
                    updated = true;
                }
            });
        }
        else {
            profilerData.functions.push(func);
        }
        persisance_service_1.PersistanceService.setItem(persistance_item_type_enum_1.PersistanceItemType.profilerData, profilerData);
        console.log();
        ui_service_1.UI.success(updated ? 'Function updated successfully!' : 'Function added successfully!');
        ui_service_1.UI.warn('Remember that you have to restart your shell in order to use this function');
    }
    deleteItem(type, id) {
        if (type === item_type_enum_1.ItemType.alias) {
        }
        if (type === item_type_enum_1.ItemType.function) { }
        if (type === item_type_enum_1.ItemType.export) { }
    }
    checkProfilerDataIntegrity() {
        return persisance_service_1.PersistanceService.checkFilesIntegrity();
    }
    initializeCoreFiles() {
        console.log(chalk.yellow('Initializing ShellProfiler...'));
        const profilerAuth = new ProfilerAtuh_entity_1.ProfilerAuth();
        const profilerData = new ProfilerData_entity_1.ProfilerData();
        const rawProfileData = '';
        profilerAuth.githubToken = null;
        profilerAuth.githubUsername = null;
        profilerData.aliases = [];
        profilerData.functions = [];
        profilerData.gistName = null;
        profilerData.userBashrcFilePath = null;
        fs.mkdirSync(general_configs_1.GENERAL.profilerDataDirectory);
        persisance_service_1.PersistanceService.setItem(persistance_item_type_enum_1.PersistanceItemType.authData, profilerAuth);
        persisance_service_1.PersistanceService.setItem(persistance_item_type_enum_1.PersistanceItemType.profilerData, profilerData);
        persisance_service_1.PersistanceService.setItem(persistance_item_type_enum_1.PersistanceItemType.rawProfileData, rawProfileData);
    }
}
exports.SystemService = SystemService;
//# sourceMappingURL=system.service.js.map