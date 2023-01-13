import { Repository } from "nodegit";
import { homePath } from "../config";

export async function getBranches(username: string, repoName: string) {
  try {
    const repoPath = `${homePath}/${username}/${repoName}`;
    const repo = await Repository.open(repoPath + "/.git");

    const branches = await repo.getReferences();

    return branches.filter((b) => b.isBranch()).map((b) => b.name().substring(11));
  } catch {
    return null;
  }
}

export async function createBranch(username: string, repoName: string, source: string, branchName: string) {
  try {
    const repoPath = `${homePath}/${username}/${repoName}`;
    const repo = await Repository.open(repoPath + "/.git");

    const sourceBranch = await repo.getBranch(source);
    const lastCommit = await repo.getBranchCommit(sourceBranch);

    const branch = await repo.createBranch(branchName, lastCommit);
    return branch.name();
  } catch {
    return null;
  }
}

export async function renameBranch(username: string, repoName: string, branchName: string, newBranchName: string) {
  try {
    const repoPath = `${homePath}/${username}/${repoName}`;
    const repo = await Repository.open(repoPath + "/.git");

    const branch = await repo.getBranch(branchName);
    const renamedBranch = await branch.rename("refs/heads/" + newBranchName, 1, "");
    return renamedBranch.name();
  } catch {
    return null;
  }
}

export async function removeBranch(username: string, repoName: string, branchName: string) {
  try {
    const repoPath = `${homePath}/${username}/${repoName}`;
    const repo = await Repository.open(repoPath + "/.git");

    const branch = await repo.getBranch(branchName);
    branch.delete();

    return branch.name();
  } catch {
    return null;
  }
}
