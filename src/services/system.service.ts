import * as os from 'os';
import * as fs from 'fs';
import * as cp from 'child_process';
import * as path from 'path';
import * as proc from 'process';
import * as chalk from 'chalk';

import { UI } from './ui.service';
import { HELP } from '../configs/help.configs';
import { GENERAL } from '../configs/general.configs';
import { ProfilerData } from '../entities/ProfilerData.entity';
import { ProfilerAuth } from '../entities/ProfilerAtuh.entity';
import { Alias } from '../entities/Alias.entity';
import { ProfilerItem } from '../entities/ProfilerItem.entity';

export class System {
    public help() {
        const set: any = [];
        HELP.forEach(h => {
            set.push({ key: h.command, value: h.options });
        });

        UI.printKeyValuePairs(set);
    }

    public setGithubUsername(username: string) {
        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }

        proc.chdir(os.homedir() + path.sep + GENERAL.profilerDataDir);
        const auth: ProfilerAuth = JSON.parse(fs.readFileSync(GENERAL.profilerAuthFile, { encoding: 'UTF-8' }));
        auth.githubUsername = username;
        this.updateAuthFile(auth);
    }

    public upsertAlias(alias: ProfilerItem) {
        let updated = false;

        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }

        proc.chdir(os.homedir() + path.sep + GENERAL.profilerDataDir);
        const profilerData: ProfilerData = JSON.parse(fs.readFileSync(GENERAL.profilerDataFile, { encoding: 'UTF-8' }));
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
        } else {
            profilerData.aliases.push(alias);
        }
        UI.success(updated ? 'Alias updated successfully!' : 'Alias added successfully!');
        this.updateDataFile(profilerData);
    }

    public upsertFunc(func: ProfilerItem) {
        let updated = false;

        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }

        proc.chdir(os.homedir() + path.sep + GENERAL.profilerDataDir);
        const profilerData: ProfilerData = JSON.parse(fs.readFileSync(GENERAL.profilerDataFile, { encoding: 'UTF-8' }));
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
        } else {
            profilerData.functions.push(func);
        }
        this.updateDataFile(profilerData);
        UI.success(updated ? 'Function updated successfully!' : 'Function added successfully!');
        console.log(profilerData);
    }

    public setGithubToken(token: string) {
        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }

        proc.chdir(os.homedir() + path.sep + GENERAL.profilerDataDir);
        const auth: ProfilerAuth = JSON.parse(fs.readFileSync(GENERAL.profilerAuthFile, { encoding: 'UTF-8' }));
        auth.githubToken = token;
        this.updateAuthFile(auth);
    }

    private checkProfilerDataIntegrity() {
        proc.chdir(os.homedir());

        if (!fs.readdirSync(proc.cwd()).find(f => f === GENERAL.profilerDataDir)) {
            return false;
        }

        proc.chdir(os.homedir() + path.sep + GENERAL.profilerDataDir);
        if (!fs.existsSync(GENERAL.profilerAuthFile)) {
            return false;
        }

        if (!fs.existsSync(GENERAL.profilerDataFile)) {
            return false;
        }

        return true;
    }

    private initializeCoreFiles() {
        UI.warn('Initializing ShellProfiler...');

        proc.chdir(os.homedir());

        const auth = new ProfilerAuth();
        const profile = new ProfilerData();

        auth.githubToken = '';
        auth.githubUsername = '';

        profile.aliases = [];
        profile.functions = [];
        profile.gistName = '';

        fs.mkdirSync(GENERAL.profilerDataDir);
        fs.writeFileSync(GENERAL.profilerDataDir + path.sep + GENERAL.profilerAuthFile, JSON.stringify(auth), { encoding: 'UTF-8' });
        fs.writeFileSync(GENERAL.profilerDataDir + path.sep + GENERAL.profilerDataFile, JSON.stringify(profile), { encoding: 'UTF-8' });
    }

    private updateAuthFile(authFile: ProfilerAuth) {
        fs.writeFileSync(os.homedir + path.sep + GENERAL.profilerDataDir + path.sep + GENERAL.profilerAuthFile, JSON.stringify(authFile), { encoding: 'UTF-8' });
    }

    private updateDataFile(dataFile: ProfilerData) {
        fs.writeFileSync(os.homedir + path.sep + GENERAL.profilerDataDir + path.sep + GENERAL.profilerDataFile, JSON.stringify(dataFile), { encoding: 'UTF-8' });
    }
}
