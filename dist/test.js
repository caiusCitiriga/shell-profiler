"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cp = require("child_process");
const proc = require("process");
console.log(proc.cwd());
console.log('Changing dir to ACTIVITIES...');
proc.chdir('C:/Code/FM/Activities');
console.log(proc.cwd());
console.log('Attempting to run git');
cp.exec('git checkout dev', (err, stdout, stderr) => {
    if (err) {
        console.log('GIT FAILED');
        return;
    }
    if (stdout) {
        console.log('GIT EXECUTED');
        cp.exec('git branch -l', (err, stdout, stderr) => {
            if (stdout) {
                console.log(stdout);
                return;
            }
        });
        return;
    }
    if (stderr) {
        console.log('GTI EXECUTED BUT RETURNED ERROR');
        console.log(stderr);
    }
});
