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
class System {
    help() {
        const set = [];
        help_configs_1.HELP.forEach(h => {
            set.push({ key: h.command, value: h.options });
        });
        ui_service_1.UI.printKeyValuePairs(set);
    }
    setGithubUsername(username) {
        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }
        proc.chdir(os.homedir() + path.sep + general_configs_1.GENERAL.profilerDataDir);
        const auth = JSON.parse(fs.readFileSync(general_configs_1.GENERAL.profilerAuthFile, { encoding: 'UTF-8' }));
        auth.githubUsername = username;
        this.updateAuthFile(auth);
    }
    upsertAlias(alias) {
        let updated = false;
        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }
        proc.chdir(os.homedir() + path.sep + general_configs_1.GENERAL.profilerDataDir);
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
        ui_service_1.UI.success(updated ? 'Alias updated successfully!' : 'Alias added successfully!');
        this.updateDataFile(profilerData);
    }
    upsertFunc(func) {
        let updated = false;
        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }
        proc.chdir(os.homedir() + path.sep + general_configs_1.GENERAL.profilerDataDir);
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
        console.log(profilerData);
    }
    setGithubToken(token) {
        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }
        proc.chdir(os.homedir() + path.sep + general_configs_1.GENERAL.profilerDataDir);
        const auth = JSON.parse(fs.readFileSync(general_configs_1.GENERAL.profilerAuthFile, { encoding: 'UTF-8' }));
        auth.githubToken = token;
        this.updateAuthFile(auth);
    }
    checkProfilerDataIntegrity() {
        proc.chdir(os.homedir());
        if (!fs.readdirSync(proc.cwd()).find(f => f === general_configs_1.GENERAL.profilerDataDir)) {
            return false;
        }
        proc.chdir(os.homedir() + path.sep + general_configs_1.GENERAL.profilerDataDir);
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
        auth.githubToken = '';
        auth.githubUsername = '';
        profile.aliases = [];
        profile.functions = [];
        profile.gistName = '';
        fs.mkdirSync(general_configs_1.GENERAL.profilerDataDir);
        fs.writeFileSync(general_configs_1.GENERAL.profilerDataDir + path.sep + general_configs_1.GENERAL.profilerAuthFile, JSON.stringify(auth), { encoding: 'UTF-8' });
        fs.writeFileSync(general_configs_1.GENERAL.profilerDataDir + path.sep + general_configs_1.GENERAL.profilerDataFile, JSON.stringify(profile), { encoding: 'UTF-8' });
    }
    updateAuthFile(authFile) {
        fs.writeFileSync(os.homedir + path.sep + general_configs_1.GENERAL.profilerDataDir + path.sep + general_configs_1.GENERAL.profilerAuthFile, JSON.stringify(authFile), { encoding: 'UTF-8' });
    }
    updateDataFile(dataFile) {
        fs.writeFileSync(os.homedir + path.sep + general_configs_1.GENERAL.profilerDataDir + path.sep + general_configs_1.GENERAL.profilerDataFile, JSON.stringify(dataFile), { encoding: 'UTF-8' });
    }
}
exports.System = System;
