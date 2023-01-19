import { Commit, ConvenientPatch, Repository, Revwalk } from "nodegit";
import { homePath } from "../config";
import { isCommitSha } from "../string.utils";
import path from "path";

export async function getCommits(username: string, repoName: string, branch: string) {
  try {
    const repoPath = path.resolve(__dirname, "../../../..");
    const repo = await Repository.open(repoPath + "/.git");
    const headCommit = await (isCommitSha(branch) ? repo.getCommit(branch) : repo.getBranchCommit(branch));
    const walker = repo.createRevWalk();
    walker.push(headCommit.id());
    walker.sorting(Revwalk.SORT.TIME);
    const commits = await walker.getCommits(999999);
    return commits.map((commit) => ({
      message: commit.message(),
      sha: commit.sha(),
      date: commit.date(),
      author: { name: commit.author().name(), email: commit.author().email() },
    }));
  } catch {
    return null;
  }
}

export async function getCommitsBetweenBranches(username: string, repoName: string, base: string, compare: string) {
  try {
    const repoPath = path.resolve(__dirname, "../../../..");
    const repo = await Repository.open(repoPath + "/.git");

    const headCommit = await repo.getBranchCommit(base);
    const headCommitCompare = await repo.getBranchCommit(compare);

    const walker = repo.createRevWalk();
    walker.push(headCommitCompare.id());
    walker.sorting(Revwalk.SORT.TIME);
    const commits = await walker.getCommitsUntil((commit: Commit) => {
      return headCommit.date().getTime() < commit.date().getTime();
    });

    if ((commits.at(-1) as Commit).date().getTime() <= headCommit.date().getTime()) {
      commits.pop();
    }

    return commits.map((commit) => ({
      message: commit.message(),
      sha: commit.sha(),
      date: commit.date(),
      author: { name: commit.author().name(), email: commit.author().email() },
    }));
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function getCommitCount(username: string, repoName: string, branch: string) {
  try {
    const repoPath = path.resolve(__dirname, "../../../..");
    const repo = await Repository.open(repoPath + "/.git");
    const headCommit = await (isCommitSha(branch) ? repo.getCommit(branch) : repo.getBranchCommit(branch));
    const walker = repo.createRevWalk();
    walker.push(headCommit.id());
    walker.sorting(Revwalk.SORT.TIME);
    return (await walker.fastWalk(999999)).length;
  } catch {
    return null;
  }
}

export async function getCommitsDiffBetweenBranches(username: string, repoName: string, base: string, compare: string) {
  try {
    const repoPath = path.resolve(__dirname, "../../../..");
    const repo = await Repository.open(repoPath + "/.git");

    const commit = await repo.getBranchCommit(compare);
    const parentCommit = await repo.getBranchCommit(base);

    return await getDiffData(commit, parentCommit);
  } catch {
    return null;
  }
}

export async function getCommit(username: string, repoName: string, sha: string) {
  try {
    const repoPath = path.resolve(__dirname, "../../../..");
    const repo = await Repository.open(repoPath + "/.git");
    const commit = await repo.getCommit(sha);
    const parentCommits = await commit.getParents(1);
    return await getDiffData(commit, parentCommits[0]);
  } catch {
    return null;
  }
}

async function getDiffData(commit: Commit, parentCommit: Commit) {
  const commitTree = await commit.getTree();
  const parentTree = await parentCommit.getTree();

  const diff = await commitTree.diff(parentTree);
  const patches = await diff.patches();

  return {
    message: commit.message(),
    sha: commit.sha(),
    date: commit.date(),
    author: { name: commit.author().name(), email: commit.author().email() },
    diff: await Promise.all(patches.map(async (patch) => getPatchData(patch, commit, parentCommit))),
  };
}

async function getPatchData(patch: ConvenientPatch, commit: Commit, parentCommit: Commit) {
  try {
    const large = patch.oldFile().size() > 20000 || patch.newFile().size() > 20000;
    const oldPath = patch.oldFile().path();
    const newPath = patch.newFile().path();

    const result: { stats: any; large: boolean; old?: any; new?: any } = {
      stats: patch.lineStats(),
      large,
    };
    if (!patch.isAdded()) {
      const oldtreeEntry = await parentCommit.getEntry(oldPath);
      result.old = {
        content: large ? "" : (await oldtreeEntry.getBlob()).toString(),
        path: oldPath,
      };
    }
    if (!patch.isDeleted()) {
      const newTreeEntry = await commit.getEntry(newPath);
      result.new = {
        content: large ? "" : (await newTreeEntry.getBlob()).toString(),
        path: newPath,
      };
    }
    return result;
  } catch (e) {
    console.log(e);
  }
}

export async function getFileHistoryCommits(username: string, repoName: string, branch: string, filePath: string) {
  try {
    const repoPath = path.resolve(__dirname, "../../../..");
    const repo = await Repository.open(repoPath + "/.git");
    const headCommit = await (isCommitSha(branch) ? repo.getCommit(branch) : repo.getBranchCommit(branch));
    const walker = repo.createRevWalk();
    walker.push(headCommit.id());
    walker.sorting(Revwalk.SORT.TIME);
    const history = await walker.fileHistoryWalk(filePath, 999999);
    return history.map((he) => ({
      message: he.commit.message(),
      sha: he.commit.sha(),
      date: he.commit.date(),
      author: { name: he.commit.author().name(), email: he.commit.author().email() },
    }));
  } catch {
    return null;
  }
}

export async function getLatestCommit(username: string, repoName: string, branch: string, blobPath: string) {
  try {
    const repoPath = path.resolve(__dirname, "../../../..");
    const repo = await Repository.open(repoPath + "/.git");
    const headCommit = await (isCommitSha(branch) ? repo.getCommit(branch) : repo.getBranchCommit(branch));
    const walker = repo.createRevWalk();
    walker.push(headCommit.id());
    walker.sorting(Revwalk.SORT.TIME);
    let history = await walker.fileHistoryWalk(blobPath, 999999);
    if (!history.length) return {};
    const commit = history[0].commit;
    const contributors = history
      .map((h) => ({ name: h.commit.author().name(), email: h.commit.author().email() }))
      .filter((value, index, array) => array.findIndex((v) => v.email === value.email) === index);
    return {
      message: commit.message(),
      sha: commit.sha(),
      date: commit.date(),
      author: { name: commit.author().name(), email: commit.author().email() },
      contributors,
    };
  } catch {
    return null;
  }
}
