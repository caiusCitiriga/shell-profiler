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
            UI.warn('Initializing ShellProfiler...');
            this.initializeCoreFiles();
        }

        proc.chdir(os.homedir() + path.sep + GENERAL.profilerDataDir);
        const auth: ProfilerAuth = JSON.parse(fs.readFileSync(GENERAL.profilerAuthFile, { encoding: 'UTF-8' }));
        auth.githubUsername = username;
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
}
