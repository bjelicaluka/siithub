"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execCmd = void 0;
const child_process_1 = require("child_process");
function execCmd(cmd) {
    return new Promise((res, rej) => {
        (0, child_process_1.exec)(cmd, (err, stdout, stderr) => {
            if (err) {
                rej(stderr);
            }
            else {
                res(stdout);
            }
        });
    });
}
exports.execCmd = execCmd;
