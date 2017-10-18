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
import { ProfilerItem } from '../entities/ProfilerItem.entity';
import { RmdirRecursive } from './rmdir-recursive.service';

export class SystemService {
    public help() {
        const set: any = [];
        HELP.forEach(h => {
            set.push({ key: h.command, value: h.options });
        });

        UI.printKeyValuePairs(set);
    }

    public init(token: string, username: string, usrBashrcPath: string) {
        if (!fs.existsSync(usrBashrcPath)) {
            console.log();
            UI.error('The path provided for the bashrc file is not valid.');
            return;
        }

        proc.chdir(os.homedir());
        RmdirRecursive.rmdirRec(GENERAL.profilerDataDirectory);

        this.initializeCoreFiles();
        this.setGithubToken(token);
        this.setGithubUsername(username);
        this.setUserBashrcFilePath(usrBashrcPath);

        //  Set the sourcing of the shell_profiler bashrc on the main bashrc file 
        let userBashrcFile = fs.readFileSync(usrBashrcPath, { encoding: 'UTF-8' }).toString();

        if (os.platform() === 'win32') {
            UI.warn('Converting path to UNIX like for sourcing.');
            const username_folder = os.userInfo().username;
            userBashrcFile += `\n#ShellProfiler source. Do not remove this.\nsource /c/Users/${username_folder}/${GENERAL.profilerDataDirectory}/${GENERAL.profilerBashrcFile}`;
        } else {
            userBashrcFile += `\n#ShellProfiler source. Do not remove this.\nsource ${os.homedir() + path.sep + GENERAL.profilerDataDirectory + path.sep + GENERAL.profilerBashrcFile}`;
        }

        fs.writeFileSync(usrBashrcPath, userBashrcFile, { encoding: 'UTF-8' });
        UI.success('ShellProfiler has been successfully initialized!');
    }

    public setGithubToken(token: string) {
        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }

        proc.chdir(os.homedir() + path.sep + GENERAL.profilerDataDirectory);
        const auth: ProfilerAuth = JSON.parse(fs.readFileSync(GENERAL.profilerAuthFile, { encoding: 'UTF-8' }));
        auth.githubToken = token;
        this.updateAuthFile(auth);
    }

    public setGithubUsername(username: string) {
        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }

        proc.chdir(os.homedir() + path.sep + GENERAL.profilerDataDirectory);
        const auth: ProfilerAuth = JSON.parse(fs.readFileSync(GENERAL.profilerAuthFile, { encoding: 'UTF-8' }));
        auth.githubUsername = username;
        this.updateAuthFile(auth);
    }

    public setUserBashrcFilePath(filePath: string) {
        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }

        proc.chdir(os.homedir() + path.sep + GENERAL.profilerDataDirectory);
        const profileData: ProfilerData = JSON.parse(fs.readFileSync(GENERAL.profilerDataFile, { encoding: 'UTF-8' }));
        profileData.userBashrcFilePath = filePath;
        this.updateDataFile(profileData);
    }

    public upsertAlias(alias: ProfilerItem) {
        let updated = false;

        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }

        proc.chdir(os.homedir() + path.sep + GENERAL.profilerDataDirectory);
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
        this.updateDataFile(profilerData);
        UI.success(updated ? 'Alias updated successfully!' : 'Alias added successfully!');
    }

    public upsertFunc(func: ProfilerItem) {
        let updated = false;

        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }

        proc.chdir(os.homedir() + path.sep + GENERAL.profilerDataDirectory);
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
    }

    private checkProfilerDataIntegrity() {
        proc.chdir(os.homedir());

        if (!fs.readdirSync(proc.cwd()).find(f => f === GENERAL.profilerDataDirectory)) {
            return false;
        }

        proc.chdir(os.homedir() + path.sep + GENERAL.profilerDataDirectory);
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
        const bashrc_file = '';

        auth.githubToken = null;
        auth.githubUsername = null;

        profile.aliases = [];
        profile.functions = [];
        profile.gistName = null;
        profile.userBashrcFilePath = null;

        fs.mkdirSync(GENERAL.profilerDataDirectory);
        fs.writeFileSync(GENERAL.profilerDataDirectory + path.sep + GENERAL.profilerAuthFile, JSON.stringify(auth), { encoding: 'UTF-8' });
        fs.writeFileSync(GENERAL.profilerDataDirectory + path.sep + GENERAL.profilerDataFile, JSON.stringify(profile), { encoding: 'UTF-8' });
        fs.writeFileSync(GENERAL.profilerDataDirectory + path.sep + GENERAL.profilerBashrcFile, bashrc_file, { encoding: 'UTF-8' });
    }

    private updateAuthFile(authFile: ProfilerAuth) {
        fs.writeFileSync(os.homedir + path.sep + GENERAL.profilerDataDirectory + path.sep + GENERAL.profilerAuthFile, JSON.stringify(authFile), { encoding: 'UTF-8' });
    }

    private updateDataFile(dataFile: ProfilerData) {
        fs.writeFileSync(os.homedir + path.sep + GENERAL.profilerDataDirectory + path.sep + GENERAL.profilerDataFile, JSON.stringify(dataFile), { encoding: 'UTF-8' });
        this.updateBashrcFile(dataFile);
    }

    private updateBashrcFile(dataFile: ProfilerData) {
        let bashrc_file = '';
        dataFile.aliases.forEach(a => bashrc_file += `#${a.name}\n${a.command}\n\n`);
        dataFile.functions.forEach(f => bashrc_file += `#${f.name}\n${f.command}\n\n`);
        console.log(bashrc_file);
        fs.writeFileSync(os.homedir + path.sep + GENERAL.profilerDataDirectory + path.sep + GENERAL.profilerBashrcFile, bashrc_file, { encoding: 'UTF-8' });
    }
}
