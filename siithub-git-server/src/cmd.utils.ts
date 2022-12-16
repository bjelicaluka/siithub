import { exec } from "child_process";

export function execCmd(cmd: string): Promise<string> {
  return new Promise((res, rej) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        rej(stderr);
      } else {
        res(stdout);
      }
    });
  });
}
