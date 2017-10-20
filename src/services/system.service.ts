import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as chalk from 'chalk';
import * as process from 'process';
import * as child_process from 'child_process';

import { HELP } from '../configs/help.configs';
import { GENERAL } from '../configs/general.configs';

import { ItemType } from '../enums/item-type.enum';

import { ProfilerData } from '../entities/ProfilerData.entity';
import { ProfilerAuth } from '../entities/ProfilerAtuh.entity';
import { ProfilerItem } from '../entities/ProfilerItem.entity';

import { UI } from './ui.service';
import { RmdirRecursive } from './rmdir-recursive.service';
import { PersistanceService } from './persisance.service';
import { PersistanceItemType } from '../enums/persistance-item-type.enum';
import { GitHubService } from './github.service';

export class SystemService {

    private github: GitHubService;

    public get isWindows(): boolean {
        return os.platform() === 'win32' ? true : false;
    }

    public get aliases(): ProfilerItem[] {
        const result = (<ProfilerData>PersistanceService.getItem(PersistanceItemType.profilerData));
        return !result.aliases ? [] : result.aliases.sort((a, b) => a.name.length - b.name.length);
    }

    public get functions(): ProfilerItem[] {
        const result = (<ProfilerData>PersistanceService.getItem(PersistanceItemType.profilerData))
        return !result.functions ? [] : result.functions.sort((a, b) => a.name.length - b.name.length);
    }

    public get profileName(): string | null {
        const result = (<ProfilerData>PersistanceService.getItem(PersistanceItemType.profilerData))
        return result.name;
    }

    public get gistId(): string | null {
        return (<ProfilerAuth>PersistanceService.getItem(PersistanceItemType.authData)).gistId;
    }

    public constructor() {
        this.github = new GitHubService();
    }

    public help(): void {
        const set: any = [];
        HELP.forEach(h => {
            set.push({ key: h.command, value: h.options });
        });

        UI.printKeyValuePairs(set);
    }

    public init(token: string, username: string, usrBashrcPath: string, domainUserFolderName?: string): void {
        if (!fs.existsSync(usrBashrcPath)) {
            console.log();
            UI.error('The path provided for the bashrc file is not valid.');
            return;
        }

        process.chdir(os.homedir());
        if (fs.existsSync(GENERAL.profilerDataDirectory)) {
            RmdirRecursive.rmdirRec(GENERAL.profilerDataDirectory);
        }

        this.initializeCoreFiles();
        this.setGithubToken(token);
        this.setGithubUsername(username);
        this.setUserBashrcFilePath(usrBashrcPath);

        //  Set the sourcing of the shell_profiler bashrc on the main bashrc file 
        let source_path = '';
        let usrBashrcFile = fs.readFileSync(usrBashrcPath, { encoding: 'UTF-8' }).toString();

        if (this.isWindows) {
            const username_folder = domainUserFolderName ? domainUserFolderName : os.userInfo().username;
            source_path = `/c/Users/${username_folder}/${GENERAL.profilerDataDirectory}/${GENERAL.profilerBashFile}`
        } else {
            source_path = os.homedir() + path.sep + GENERAL.profilerDataDirectory + path.sep + GENERAL.profilerBashFile;
        }

        usrBashrcFile += `\n#ShellProfiler source. Do not remove this.\nsource ${source_path}`;
        fs.writeFileSync(usrBashrcPath, usrBashrcFile, { encoding: 'UTF-8' });
    }

    public setGithubToken(token: string) {
        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }

        const auth: ProfilerAuth = <ProfilerAuth>PersistanceService.getItem(PersistanceItemType.authData);
        auth.githubToken = token;

        PersistanceService.setItem(PersistanceItemType.authData, auth);
    }

    public setGithubUsername(username: string) {
        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }

        const auth: ProfilerAuth = <ProfilerAuth>PersistanceService.getItem(PersistanceItemType.authData);
        auth.githubUsername = username;

        PersistanceService.setItem(PersistanceItemType.authData, auth);
    }

    public setUserBashrcFilePath(filePath: string) {
        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }

        process.chdir(os.homedir() + path.sep + GENERAL.profilerDataDirectory);
        const profilerData: ProfilerData = JSON.parse(fs.readFileSync(GENERAL.profilerDataFile, { encoding: 'UTF-8' }));
        profilerData.userBashrcFilePath = filePath;

        PersistanceService.setItem(PersistanceItemType.profilerData, profilerData);
        this.updateGist(profilerData);
    }

    public setGistId(id: string) {
        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }

        const auth: ProfilerAuth = <ProfilerAuth>PersistanceService.getItem(PersistanceItemType.authData);
        auth.gistId = id;

        PersistanceService.setItem(PersistanceItemType.authData, auth);
    }

    public upsertAlias(alias: ProfilerItem) {

        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }

        let updated = false;
        const profilerData: ProfilerData = <ProfilerData>PersistanceService.getItem(PersistanceItemType.profilerData);
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

        PersistanceService.setItem(PersistanceItemType.profilerData, profilerData);
        this.updateGist(profilerData);

        console.log();
        UI.success(updated ? 'Alias updated successfully!' : 'Alias added successfully!');
        UI.warn('Remember that you have to restart your shell in order to use this alias');
    }

    public upsertFunc(func: ProfilerItem) {
        if (!this.checkProfilerDataIntegrity()) {
            this.initializeCoreFiles();
        }

        let updated = false;
        const profilerData: ProfilerData = <ProfilerData>PersistanceService.getItem(PersistanceItemType.profilerData);
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

        PersistanceService.setItem(PersistanceItemType.profilerData, profilerData);
        this.updateGist(profilerData);

        console.log();
        UI.success(updated ? 'Function updated successfully!' : 'Function added successfully!');
        UI.warn('Remember that you have to restart your shell in order to use this function');
    }

    public deleteItem(type: ItemType, id: string) {
        if (type === ItemType.alias) {
            const profilerData = <ProfilerData>PersistanceService.getItem(PersistanceItemType.profilerData);
            profilerData.aliases = profilerData.aliases.filter(a => a.id !== id);

            PersistanceService.setItem(PersistanceItemType.profilerData, profilerData);
            this.updateGist(profilerData);
        }

        if (type === ItemType.function) {
            const profilerData = <ProfilerData>PersistanceService.getItem(PersistanceItemType.profilerData);
            profilerData.functions = profilerData.functions.filter(f => f.id !== id);

            PersistanceService.setItem(PersistanceItemType.profilerData, profilerData);
            this.updateGist(profilerData);
        }
        if (type === ItemType.export) { }
    }

    public checkProfilerDataIntegrity() {
        return PersistanceService.checkFilesIntegrity();
    }

    private updateGist(profilerData: ProfilerData) {
        const gistId = (<ProfilerAuth>PersistanceService.getItem(PersistanceItemType.authData)).gistId;
        if (gistId) {
            this.github.updateGist(profilerData, gistId);
        } else {
            UI.warn('Gist ID not found, please set it with the set --gist-id command or run the init command');
        }
    }

    private initializeCoreFiles() {
        console.log(chalk.yellow('Initializing ShellProfiler...'));

        const profilerAuth = new ProfilerAuth();
        const profilerData = new ProfilerData();
        const rawProfileData = '';

        profilerAuth.githubToken = null;
        profilerAuth.githubUsername = null;

        profilerData.aliases = [];
        profilerData.functions = [];
        profilerData.userBashrcFilePath = null;

        fs.mkdirSync(GENERAL.profilerDataDirectory);
        PersistanceService.setItem(PersistanceItemType.authData, profilerAuth);
        PersistanceService.setItem(PersistanceItemType.profilerData, profilerData);
        PersistanceService.setItem(PersistanceItemType.rawProfileData, rawProfileData);
    }
}
