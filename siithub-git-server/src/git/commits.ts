import { Commit, Repository, Revwalk } from "nodegit";
import { homePath } from "../config";
import { getBlobFromCommit } from "./blob.utils";

export async function getCommits(username: string, repoName: string, branch: string) {
  try {
    const repoPath = `${homePath}/${username}/${repoName}`;
    const repo = await Repository.open(repoPath + "/.git");
    const headCommit = await repo.getBranchCommit(branch);
    return listAllCommits(repo, headCommit);
  } catch (e) {
    return null;
  }
}

export async function getCommit(username: string, repoName: string, sha: string) {
  const repoPath = `${homePath}/${username}/${repoName}`;
  const repo = await Repository.open(repoPath + "/.git");
  const commit = await repo.getCommit(sha);

  const result = {
    message: commit.message(),
    sha: commit.sha(),
    date: commit.date(),
    author: commit.author().name(),
    diff: [] as { old: string | undefined; new: string | undefined }[],
  };

  const diffList = await commit.getDiff();
  for (const diff of diffList) {
    const patches = await diff.patches();
    for (const patch of patches) {
      result.diff.push({
        old: (
          await getBlobFromCommit(username, repoName, commit.parentId(0)?.tostrS(), patch.oldFile().path())
        )?.toString(),
        new: (await getBlobFromCommit(username, repoName, sha, patch.newFile().path()))?.toString(),
      });
    }
  }

  return result;
}

async function listAllCommits(repo: Repository, headCommit: Commit) {
  const walker = repo.createRevWalk();
  walker.push(headCommit.id());
  walker.sorting(Revwalk.SORT.TIME);
  const commits = await walker.getCommits(999999);
  return Promise.all(
    commits.map(async (commit) => {
      return {
        message: commit.message(),
        sha: commit.sha(),
        date: commit.date(),
        author: commit.author().name(),
      };
    })
  );
}
