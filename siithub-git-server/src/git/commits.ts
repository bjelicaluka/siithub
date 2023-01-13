import { Commit, ConvenientPatch, Repository, Revwalk } from "nodegit";
import { homePath } from "../config";

export async function getCommits(username: string, repoName: string, branch: string) {
  try {
    const repoPath = `${homePath}/${username}/${repoName}`;
    const repo = await Repository.open(repoPath + "/.git");
    const headCommit = await repo.getBranchCommit(branch);
    const walker = repo.createRevWalk();
    walker.push(headCommit.id());
    walker.sorting(Revwalk.SORT.TIME);
    const commits = await walker.getCommits(999999);
    return commits.map((commit) => ({
      message: commit.message(),
      sha: commit.sha(),
      date: commit.date(),
      author: commit.author().name(),
    }));
  } catch {
    return null;
  }
}

export async function getCommit(username: string, repoName: string, sha: string) {
  const repoPath = `${homePath}/${username}/${repoName}`;
  const repo = await Repository.open(repoPath + "/.git");
  const commit = await repo.getCommit(sha);
  const parentCommits = await commit.getParents(1);
  const diffList = await commit.getDiff();
  const diff = diffList[0];
  const patches = await diff.patches();

  return {
    message: commit.message(),
    sha: commit.sha(),
    date: commit.date(),
    author: commit.author().name(),
    diff: await Promise.all(patches.map(async (patch) => await getPatchData(patch, commit, parentCommits[0]))),
  };
}

async function getPatchData(patch: ConvenientPatch, commit: Commit, parentCommit: Commit) {
  let large = patch.oldFile().size() > 20000 || patch.newFile().size() > 20000;
  let oldPath = patch.oldFile().path();
  let newPath = patch.newFile().path();
  let result: { stats: any; large: boolean; old?: any; new?: any } = {
    stats: patch.lineStats(),
    large,
  };
  if (!patch.isAdded()) {
    let oldtreeEntry = await parentCommit.getEntry(oldPath);
    result.old = {
      content: large ? "" : (await oldtreeEntry.getBlob()).toString(),
      path: oldPath,
    };
  }
  if (!patch.isDeleted()) {
    let newTreeEntry = await commit.getEntry(newPath);
    result.new = {
      content: large ? "" : (await newTreeEntry.getBlob()).toString(),
      path: newPath,
    };
  }
  return result;
}