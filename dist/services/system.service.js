"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const fs = require("fs");
const path = require("path");
const proc = require("process");
const ui_service_1 = require("./ui.service");
const help_configs_1 = require("../configs/help.configs");
const general_configs_1 = require("../configs/general.configs");
const ProfilerData_entity_1 = require("../entities/ProfilerData.entity");
const ProfilerAtuh_entity_1 = require("../entities/ProfilerAtuh.entity");
const rmdir_recursive_service_1 = require("./rmdir-recursive.service");
class SystemService {
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
        proc.chdir(os.homedir());
        rmdir_recursive_service_1.RmdirRecursive.rmdirRec(general_configs_1.GENERAL.profilerDataDirectory);
        this.initializeCoreFiles();
        this.setGithubToken(token);
        this.setGithubUsername(username);
        this.setUserBashrcFilePath(usrBashrcPath);
        //  Set the sourcing of the shell_profiler bashrc on the main bashrc file 
        let userBashrcFile = fs.readFileSync(usrBashrcPath, { encoding: 'UTF-8' }).toString();
        if (os.platform() === 'win32') {
            ui_service_1.UI.warn('Converting path to UNIX like for sourcing.');
            const username_folder = os.userInfo().username;
            userBashrcFile += `\n#ShellProfiler source. Do not remove this.\nsource /c/Users/${username_folder}/${general_configs_1.GENERAL.profilerDataDirectory}/${general_configs_1.GENERAL.profilerBashrcFile}`;
        }
        else {
            userBashrcFile += `\n#ShellProfiler source. Do not remove this.\nsource ${os.homedir() + path.sep + general_configs_1.GENERAL.profilerDataDirectory + path.sep + general_configs_1.GENERAL.profilerBashrcFile}`;
        }
        fs.writeFileSync(usrBashrcPath, userBashrcFile, { encoding: 'UTF-8' });
        ui_service_1.UI.success('ShellProfiler has been successfully initialized!');
    }
    setGithubToken(token) {
        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }
        proc.chdir(os.homedir() + path.sep + general_configs_1.GENERAL.profilerDataDirectory);
        const auth = JSON.parse(fs.readFileSync(general_configs_1.GENERAL.profilerAuthFile, { encoding: 'UTF-8' }));
        auth.githubToken = token;
        this.updateAuthFile(auth);
    }
    setGithubUsername(username) {
        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }
        proc.chdir(os.homedir() + path.sep + general_configs_1.GENERAL.profilerDataDirectory);
        const auth = JSON.parse(fs.readFileSync(general_configs_1.GENERAL.profilerAuthFile, { encoding: 'UTF-8' }));
        auth.githubUsername = username;
        this.updateAuthFile(auth);
    }
    setUserBashrcFilePath(filePath) {
        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }
        proc.chdir(os.homedir() + path.sep + general_configs_1.GENERAL.profilerDataDirectory);
        const profileData = JSON.parse(fs.readFileSync(general_configs_1.GENERAL.profilerDataFile, { encoding: 'UTF-8' }));
        profileData.userBashrcFilePath = filePath;
        this.updateDataFile(profileData);
    }
    upsertAlias(alias) {
        let updated = false;
        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }
        proc.chdir(os.homedir() + path.sep + general_configs_1.GENERAL.profilerDataDirectory);
        const profilerData = JSON.parse(fs.readFileSync(general_configs_1.GENERAL.profilerDataFile, { encoding: 'UTF-8' }));
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
        this.updateDataFile(profilerData);
        ui_service_1.UI.success(updated ? 'Alias updated successfully!' : 'Alias added successfully!');
    }
    upsertFunc(func) {
        let updated = false;
        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }
        proc.chdir(os.homedir() + path.sep + general_configs_1.GENERAL.profilerDataDirectory);
        const profilerData = JSON.parse(fs.readFileSync(general_configs_1.GENERAL.profilerDataFile, { encoding: 'UTF-8' }));
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
        this.updateDataFile(profilerData);
        ui_service_1.UI.success(updated ? 'Function updated successfully!' : 'Function added successfully!');
    }
    checkProfilerDataIntegrity() {
        proc.chdir(os.homedir());
        if (!fs.readdirSync(proc.cwd()).find(f => f === general_configs_1.GENERAL.profilerDataDirectory)) {
            return false;
        }
        proc.chdir(os.homedir() + path.sep + general_configs_1.GENERAL.profilerDataDirectory);
        if (!fs.existsSync(general_configs_1.GENERAL.profilerAuthFile)) {
            return false;
        }
        if (!fs.existsSync(general_configs_1.GENERAL.profilerDataFile)) {
            return false;
        }
        return true;
    }
    initializeCoreFiles() {
        ui_service_1.UI.warn('Initializing ShellProfiler...');
        proc.chdir(os.homedir());
        const auth = new ProfilerAtuh_entity_1.ProfilerAuth();
        const profile = new ProfilerData_entity_1.ProfilerData();
        const bashrc_file = '';
        auth.githubToken = null;
        auth.githubUsername = null;
        profile.aliases = [];
        profile.functions = [];
        profile.gistName = null;
        profile.userBashrcFilePath = null;
        fs.mkdirSync(general_configs_1.GENERAL.profilerDataDirectory);
        fs.writeFileSync(general_configs_1.GENERAL.profilerDataDirectory + path.sep + general_configs_1.GENERAL.profilerAuthFile, JSON.stringify(auth), { encoding: 'UTF-8' });
        fs.writeFileSync(general_configs_1.GENERAL.profilerDataDirectory + path.sep + general_configs_1.GENERAL.profilerDataFile, JSON.stringify(profile), { encoding: 'UTF-8' });
        fs.writeFileSync(general_configs_1.GENERAL.profilerDataDirectory + path.sep + general_configs_1.GENERAL.profilerBashrcFile, bashrc_file, { encoding: 'UTF-8' });
    }
    updateAuthFile(authFile) {
        fs.writeFileSync(os.homedir + path.sep + general_configs_1.GENERAL.profilerDataDirectory + path.sep + general_configs_1.GENERAL.profilerAuthFile, JSON.stringify(authFile), { encoding: 'UTF-8' });
    }
    updateDataFile(dataFile) {
        fs.writeFileSync(os.homedir + path.sep + general_configs_1.GENERAL.profilerDataDirectory + path.sep + general_configs_1.GENERAL.profilerDataFile, JSON.stringify(dataFile), { encoding: 'UTF-8' });
        this.updateBashrcFile(dataFile);
    }
    updateBashrcFile(dataFile) {
        let bashrc_file = '';
        dataFile.aliases.forEach(a => bashrc_file += `#${a.name}\n${a.command}\n\n`);
        dataFile.functions.forEach(f => bashrc_file += `#${f.name}\n${f.command}\n\n`);
        console.log(bashrc_file);
        fs.writeFileSync(os.homedir + path.sep + general_configs_1.GENERAL.profilerDataDirectory + path.sep + general_configs_1.GENERAL.profilerBashrcFile, bashrc_file, { encoding: 'UTF-8' });
    }
}
exports.SystemService = SystemService;
