"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const persistance_item_type_enum_1 = require("../enums/persistance-item-type.enum");
const fs = require("fs");
const general_configs_1 = require("../configs/general.configs");
const os = require("os");
const path = require("path");
class PersistanceService {
    static getItem(itemType) {
        process.chdir(os.homedir() + path.sep + general_configs_1.GENERAL.profilerDataDirectory);
        if (itemType === persistance_item_type_enum_1.PersistanceItemType.profilerData) {
            return JSON.parse(fs.readFileSync(general_configs_1.GENERAL.profilerDataFile, { encoding: 'UTF-8' }));
        }
        if (itemType === persistance_item_type_enum_1.PersistanceItemType.authData) {
            return JSON.parse(fs.readFileSync(general_configs_1.GENERAL.profilerAuthFile, { encoding: 'UTF-8' }));
        }
        return null;
    }
    static setItem(itemType, item, skipUpdate) {
        process.chdir(os.homedir());
        if (itemType === persistance_item_type_enum_1.PersistanceItemType.authData) {
            fs.writeFileSync(os.homedir + path.sep + general_configs_1.GENERAL.profilerDataDirectory + path.sep + general_configs_1.GENERAL.profilerAuthFile, JSON.stringify(item), { encoding: 'UTF-8' });
        }
        if (itemType === persistance_item_type_enum_1.PersistanceItemType.profilerData) {
            fs.writeFileSync(os.homedir + path.sep + general_configs_1.GENERAL.profilerDataDirectory + path.sep + general_configs_1.GENERAL.profilerDataFile, JSON.stringify(item), { encoding: 'UTF-8' });
            //  Update the bashrc file
            let bashrc_file = '';
            if (item.aliases) {
                item.aliases.forEach(a => bashrc_file += `#${a.name}\n${a.command}\n\n`);
            }
            if (item.functions) {
                item.functions.forEach(f => bashrc_file += `#${f.name}\n${f.command}\n\n`);
            }
            fs.writeFileSync(os.homedir + path.sep + general_configs_1.GENERAL.profilerDataDirectory + path.sep + general_configs_1.GENERAL.profilerBashFile, bashrc_file, { encoding: 'UTF-8' });
        }
        if (itemType === persistance_item_type_enum_1.PersistanceItemType.rawProfileData) {
            fs.writeFileSync(general_configs_1.GENERAL.profilerDataDirectory + path.sep + general_configs_1.GENERAL.profilerBashFile, item, { encoding: 'UTF-8' });
        }
    }
    static checkFilesIntegrity() {
        process.chdir(os.homedir());
        if (!fs.readdirSync(process.cwd()).find(f => f === general_configs_1.GENERAL.profilerDataDirectory)) {
            return false;
        }
        process.chdir(os.homedir() + path.sep + general_configs_1.GENERAL.profilerDataDirectory);
        if (!fs.existsSync(general_configs_1.GENERAL.profilerAuthFile)) {
            return false;
        }
        if (!fs.existsSync(general_configs_1.GENERAL.profilerDataFile)) {
            return false;
        }
        if (!fs.existsSync(general_configs_1.GENERAL.profilerBashFile)) {
            return false;
        }
        return true;
    }
}
exports.PersistanceService = PersistanceService;
//# sourceMappingURL=persisance.service.js.map