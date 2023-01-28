import { Repository } from "nodegit";
import fs from "fs";
import { execCmd } from "../cmd.utils";
import { createUser } from "../user.utils";
import { addGroup, addUserToGroup, deleteGroup } from "./group.utils";
import { homePath } from "../config";

export async function createRepo(username: string, repoName: string, publicRepo = false) {
  if (!fs.existsSync(`${homePath}/${username}`)) {
    await createUser(username);
  }
  const groupName = `${username}-${repoName}`;

  await addGroup(groupName);
  await addUserToGroup(groupName, username);

  const repoPath = `${homePath}/${username}/${repoName}`;
  if (!fs.existsSync(`${repoPath}/.git`)) {
    await Repository.init(`${repoPath}/.git`, 1);

    await execCmd(`chown -R ${username}:${groupName} ${repoPath}`);
    // owner full access | group full access (collabs) | others no access
    await execCmd(`chmod -R 77${publicRepo ? 5 : 0} ${repoPath}`);
  }
}

export async function removeRepo(username: string, repoName: string) {
  if (!fs.existsSync(`/home/_deleted`)) {
    await execCmd(`mkdir /home/_deleted`);
  }
  if (fs.existsSync(`${homePath}/${username}/${repoName}`)) {
    await execCmd(`cp -r ${homePath}/${username}/${repoName} /home/_deleted`);
    await execCmd(`rm -r ${homePath}/${username}/${repoName}`);
    await deleteGroup(`${username}-${repoName}`);
  }
}

export async function createRepoFork(
  username: string,
  repoName: string,
  fromUsername: string,
  fromRepositoryName: string,
  publicRepo = false,
  only1Branch?: string
) {
  if (!fs.existsSync(`${homePath}/${username}`)) {
    await createUser(username);
  }
  const groupName = `${username}-${repoName}`;

  await addGroup(groupName);
  await addUserToGroup(groupName, username);

  const forkedRepoPath = `${homePath}/${fromUsername}/${fromRepositoryName}`;
  const repoPath = `${homePath}/${username}/${repoName}`;

  console.log("Copy start: ", new Date().toISOString());

  if (only1Branch) await execCmd(`git clone -n -b ${only1Branch} --single-branch ${forkedRepoPath} ${repoPath}`);
  else await execCmd(`cp -r ${forkedRepoPath} ${repoPath}`);

  console.log("Copy end: ", new Date().toISOString());

  await execCmd(`chown -R ${username}:${groupName} ${repoPath}`);
  // owner full access | group full access (collabs) | others no access
  await execCmd(`chmod -R 77${publicRepo ? 5 : 0} ${repoPath}`);
}
