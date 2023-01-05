import { Repository } from "nodegit";
import fs from "fs";
import { execCmd } from "../cmd.utils";
import { createUser } from "../user.utils";
import { addGroup, addUserToGroup, deleteGroup, deleteUserFromGroup } from "./group.utils";

const homePath = "/home";

export async function createRepo(username: string, repoName: string) {
  if (!fs.existsSync(`${homePath}/${username}`)) {
    await createUser(username);
  }

  await addGroup(repoName);
  await addUserToGroup(repoName, username);

  const repoPath = `${homePath}/${username}/${repoName}`;
  if (!fs.existsSync(`${repoPath}/.git`)) {
    await Repository.init(`${repoPath}/.git`, 1);

    await execCmd(`chown -R ${username}:${repoName} ${repoPath}`);
    // owner full access | group full access (collabs) | others no access
    await execCmd(`chmod 770 ${repoPath}`);
  }
}

export async function removeRepo(username: string, repoName: string) {
  if (!fs.existsSync(`/home/_deleted`)) {
    await execCmd(`mkdir /home/_deleted`);
  }
  if (fs.existsSync(`${homePath}/${username}/${repoName}`)) {
    await execCmd(`cp -r ${homePath}/${username}/${repoName} /home/_deleted`);
    await execCmd(`rm -r ${homePath}/${username}/${repoName}`);
    await deleteGroup(repoName);
  }
}
