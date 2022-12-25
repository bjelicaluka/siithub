import { execCmd } from "./cmd.utils";

export async function createUser(username: string) {
  await execCmd(`adduser ${username} -D`);
  // Note: Alpine user needs to have a pwd for pub key auth to work!
  await execCmd(`echo '${username}:default1234siithub'|chpasswd`);
  await execCmd(`mkdir /home/${username}/.ssh`);
  await execCmd(`touch /home/${username}/.ssh/authorized_keys`);
  await execCmd(`chown -R ${username} /home/${username}/.ssh`);
}
