import { execCmd } from "./cmd.utils";

export async function addKey(username: string, key: string) {
  await execCmd(`echo '${key}' >> /home/${username}/.ssh/authorized_keys`);
}

export async function removeKey(username: string, key: string) {
  const result = await execCmd(`cat /home/${username}/.ssh/authorized_keys`);
  await execCmd(
    `echo '${result.replace(key, "")}' > /home/${username}/.ssh/authorized_keys`
  );
}
