import { Commit, ConvenientPatch, Merge, Repository, Revwalk, Signature } from "nodegit";
import { homePath } from "../config";
import { isCommitSha } from "../string.utils";

export async function getCommits(username: string, repoName: string, branch: string, withStats = false) {
  try {
    const repoPath = `${homePath}/${username}/${repoName}`;
    const repo = await Repository.open(repoPath + "/.git");
    const headCommit = await (isCommitSha(branch) ? repo.getCommit(branch) : repo.getBranchCommit(branch));
    const walker = repo.createRevWalk();
    walker.push(headCommit.id());
    walker.sorting(Revwalk.SORT.TIME);
    const commits = await walker.getCommits(999999);

    return Promise.all(
      commits.map(async (commit) => {
        const commitData = {
          message: commit.message(),
          sha: commit.sha(),
          date: commit.date(),
          author: { name: commit.author().name(), email: commit.author().email() },
        };
        if (!withStats) return commitData;

        const diff = await commit.getDiff();
        if (diff.length > 1) return { ...commitData, stats: { add: 0, del: 0, files: 0 } }; //if merge
        const ds = await diff[0].getStats();
        const stats = { add: ds.insertions(), del: ds.deletions(), files: ds.filesChanged() };
        return { ...commitData, stats };
      })
    );
  } catch {
    return null;
  }
}

export async function getCommitsBetweenBranches(username: string, repoName: string, base: string, compare: string) {
  try {
    const repoPath = `${homePath}/${username}/${repoName}`;
    const repo = await Repository.open(repoPath + "/.git");

    const headCommit = await (isCommitSha(base) ? repo.getCommit(base) : repo.getBranchCommit(base));
    const headCommitCompare = await (isCommitSha(compare) ? repo.getCommit(compare) : repo.getBranchCommit(compare));

    const walkerHead = repo.createRevWalk();
    walkerHead.push(headCommit.id());
    const commitsOnHead = new Set((await walkerHead.fastWalk(999999)).map((id) => id.tostrS()));

    const walkerHeadCompare = repo.createRevWalk();
    walkerHeadCompare.push(headCommitCompare.id());
    const commitsOnHeadCompare = await walkerHeadCompare.getCommits(999999);

    const commits = commitsOnHeadCompare?.filter((c) => !commitsOnHead.has(c.id().tostrS()));
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

export async function getCommitsDiffBetweenBranches(username: string, repoName: string, base: string, compare: string) {
  try {
    const repoPath = `${homePath}/${username}/${repoName}`;
    const repo = await Repository.open(repoPath + "/.git");

    const commit = await (isCommitSha(compare) ? repo.getCommit(compare) : repo.getBranchCommit(compare));
    const parentCommit = await (isCommitSha(base) ? repo.getCommit(base) : repo.getBranchCommit(base));

    return await getDiffData(commit, parentCommit);
  } catch {
    return null;
  }
}

export async function getCommit(username: string, repoName: string, sha: string) {
  try {
    const repoPath = `${homePath}/${username}/${repoName}`;
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
  const large = patch.oldFile().size() > 20000 || patch.newFile().size() > 20000;
  const oldPath = patch.oldFile().path();
  const newPath = patch.newFile().path();

  const result: { stats: any; large: boolean; old?: any; new?: any } = {
    stats: patch.lineStats(),
    large,
  };

  try {
    if (!patch.isAdded()) {
      const oldtreeEntry = await parentCommit.getEntry(oldPath);
      result.old = {
        content: large ? "" : (await oldtreeEntry.getBlob()).toString(),
        path: oldPath,
      };
    }
  } catch {}
  try {
    if (!patch.isDeleted()) {
      const newTreeEntry = await commit.getEntry(newPath);
      result.new = {
        content: large ? "" : (await newTreeEntry.getBlob()).toString(),
        path: newPath,
      };
    }
  } catch {}
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
export async function getCommitsSha(username: string, repoName: string, target: string) {
  try {
    const repoPath = `${homePath}/${username}/${repoName}`;
    const repo = await Repository.open(repoPath + "/.git");

    const commit = await repo.getBranchCommit(target);
    return commit.sha();
  } catch {
    return null;
  }
}
export async function mergeCommits(username: string, repoName: string, base: string, compare: string) {
  const signature = Signature.now("Siithub", "auto-merge@siithub.com");
  const repoPath = `${homePath}/${username}/${repoName}`;
  const repo = await Repository.open(repoPath + "/.git");

  const commit = await repo.getBranchCommit(compare);
  const parentCommit = await repo.getBranchCommit(base);

  const index = await Merge.commits(repo, parentCommit, commit, undefined);
  if (index.hasConflicts()) {
    return null;
  }

  const oid = await index.writeTreeTo(repo);
  await repo.createCommit("refs/heads/" + base, signature, signature, `Merged ${compare} into ${base}`, oid, [
    parentCommit,
    commit,
  ]);

  return {
    base: parentCommit.sha(),
    compare: commit.sha(),
  };
}
