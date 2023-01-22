import { Commit, ConvenientPatch, Repository, Revwalk } from "nodegit";
import { homePath } from "../config";
import { isCommitSha } from "../string.utils";

export async function getCommits(username: string, repoName: string, branch: string, withDiff = false) {
  try {
    const repoPath = `${homePath}/${username}/${repoName}`;
    const repo = await Repository.open(repoPath + "/.git");
    const headCommit = await (isCommitSha(branch) ? repo.getCommit(branch) : repo.getBranchCommit(branch));
    const walker = repo.createRevWalk();
    walker.push(headCommit.id());
    walker.sorting(Revwalk.SORT.TIME);
    const commits = await walker.getCommits(999999);
    return await Promise.all(
      commits.map(async (commit) => ({
        message: commit.message(),
        sha: commit.sha(),
        date: commit.date(),
        author: { name: commit.author().name(), email: commit.author().email() },
        ...(withDiff
          ? {
              diff: await getCommitDiff(commit),
            }
          : {}),
      }))
    );
  } catch {
    return null;
  }
}

export async function getCommitCount(username: string, repoName: string, branch: string) {
  try {
    const repoPath = `${homePath}/${username}/${repoName}`;
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

export async function getCommit(username: string, repoName: string, sha: string) {
  try {
    const repoPath = `${homePath}/${username}/${repoName}`;
    const repo = await Repository.open(repoPath + "/.git");
    const commit = await repo.getCommit(sha);

    return {
      message: commit.message(),
      sha: commit.sha(),
      date: commit.date(),
      author: { name: commit.author().name(), email: commit.author().email() },
      diff: await getCommitDiff(commit),
    };
  } catch {
    return null;
  }
}

async function getCommitDiff(commit: Commit) {
  const parentCommits = await commit.getParents(1);
  const diffList = await commit.getDiff();
  const diff = diffList[0];
  const patches = await diff.patches();
  return await Promise.all(patches.map(async (patch) => await getPatchData(patch, commit, parentCommits[0])));
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

export async function getFileHistoryCommits(username: string, repoName: string, branch: string, filePath: string) {
  try {
    const repoPath = `${homePath}/${username}/${repoName}`;
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
    const repoPath = `${homePath}/${username}/${repoName}`;
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
