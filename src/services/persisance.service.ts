import { PersistanceItemType } from '../enums/persistance-item-type.enum';

import { ProfilerAuth } from '../entities/ProfilerAtuh.entity';
import { ProfilerData } from '../entities/ProfilerData.entity';
import * as fs from 'fs';
import { GENERAL } from '../configs/general.configs';
import * as os from 'os';
import * as path from 'path';

export class PersistanceService {

    public static getItem(itemType: PersistanceItemType): ProfilerAuth | ProfilerData | null {
        process.chdir(os.homedir() + path.sep + GENERAL.profilerDataDirectory);

        if (itemType === PersistanceItemType.profilerData) {
            return <ProfilerData>JSON.parse(fs.readFileSync(GENERAL.profilerDataFile, { encoding: 'UTF-8' }));
        }

        if (itemType === PersistanceItemType.authData) {
            return <ProfilerAuth>JSON.parse(fs.readFileSync(GENERAL.profilerAuthFile, { encoding: 'UTF-8' }));
        }

        return null
    }

    public static setItem(itemType: PersistanceItemType, item: ProfilerAuth | ProfilerData | string, skipUpdate?: boolean): void {
        process.chdir(os.homedir());

        if (itemType === PersistanceItemType.authData) {
            fs.writeFileSync(os.homedir + path.sep + GENERAL.profilerDataDirectory + path.sep + GENERAL.profilerAuthFile, JSON.stringify(item), { encoding: 'UTF-8' });
        }

        if (itemType === PersistanceItemType.profilerData) {
            fs.writeFileSync(os.homedir + path.sep + GENERAL.profilerDataDirectory + path.sep + GENERAL.profilerDataFile, JSON.stringify(item), { encoding: 'UTF-8' });

            //  Update the bashrc file
            let bashrc_file = '';
            if ((<ProfilerData>item).aliases) {
                (<ProfilerData>item).aliases.forEach(a => bashrc_file += `#${a.name}\n${a.command}\n\n`);
            }
            if ((<ProfilerData>item).functions) {
                (<ProfilerData>item).functions.forEach(f => bashrc_file += `#${f.name}\n${f.command}\n\n`);
            }
            fs.writeFileSync(os.homedir + path.sep + GENERAL.profilerDataDirectory + path.sep + GENERAL.profilerBashFile, bashrc_file, { encoding: 'UTF-8' });
        }

        if (itemType === PersistanceItemType.rawProfileData) {
            fs.writeFileSync(GENERAL.profilerDataDirectory + path.sep + GENERAL.profilerBashFile, item, { encoding: 'UTF-8' });
        }
    }

    public static checkFilesIntegrity() {
        process.chdir(os.homedir());

        if (!fs.readdirSync(process.cwd()).find(f => f === GENERAL.profilerDataDirectory)) {
            return false;
        }

        process.chdir(os.homedir() + path.sep + GENERAL.profilerDataDirectory);
        if (!fs.existsSync(GENERAL.profilerAuthFile)) {
            return false;
        }

        if (!fs.existsSync(GENERAL.profilerDataFile)) {
            return false;
        }

        if (!fs.existsSync(GENERAL.profilerBashFile)) {
            return false;
        }

        return true;
    }

}