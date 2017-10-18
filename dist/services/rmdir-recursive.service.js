"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
class RmdirRecursive {
    static rmdirRec(dir) {
        let list = fs.readdirSync(dir);
        for (var i = 0; i < list.length; i++) {
            let filename = path.join(dir, list[i]);
            let stat = fs.statSync(filename);
            if (filename == "." || filename == "..") {
                // pass these files
            }
            else if (stat.isDirectory()) {
                // rmdir recursively
                RmdirRecursive.rmdirRec(filename);
            }
            else {
                // rm fiilename
                fs.unlinkSync(filename);
            }
        }
        fs.rmdirSync(dir);
    }
    ;
}
exports.RmdirRecursive = RmdirRecursive;
//# sourceMappingURL=rmdir-recursive.service.js.map