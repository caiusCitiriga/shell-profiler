import * as path from 'path';
import * as fs from 'fs';

export class RmdirRecursive {
    public static rmdirRec(dir: string) {
        let list = fs.readdirSync(dir);
        for (var i = 0; i < list.length; i++) {
            let filename = path.join(dir, list[i]);
            let stat = fs.statSync(filename);

            if (filename == "." || filename == "..") {
                // pass these files
            } else if (stat.isDirectory()) {
                // rmdir recursively
                RmdirRecursive.rmdirRec(filename);
            } else {
                // rm fiilename
                fs.unlinkSync(filename);
            }
        }
        fs.rmdirSync(dir);
    };
}