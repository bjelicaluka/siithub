import { Commit, Repository, Revwalk } from "nodegit";
import { homePath } from "../config";
import { getBlobFromCommit } from "./blob.utils";

export async function getCommits(username: string, repoName: string, branch: string) {
  try {
    const repoPath = `${homePath}/${username}/${repoName}`;
    const repo = await Repository.open(repoPath + "/.git");
    const headCommit = await repo.getBranchCommit(branch);
    return listAllCommits(repo, headCommit);
  } catch {
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
    diff: [] as {
      old: { path: string; content: string | undefined };
      new: { path: string; content: string | undefined };
    }[],
  };

  const diffList = await commit.getDiff();
  for (const diff of diffList) {
    const patches = await diff.patches();
    for (const patch of patches) {
      const oldPath = patch.oldFile().path();
      const newPath = patch.newFile().path();
      const oldContent =
        (await getBlobFromCommit(username, repoName, commit.parentId(0)?.tostrS(), oldPath))?.toString()?.split("\n") ??
        [];
      const newContent = (await getBlobFromCommit(username, repoName, sha, newPath))?.toString()?.split("\n") ?? [];
      result.diff.push({
        old: {
          path: oldPath,
          content: oldContent.slice(0, oldContent.length > 1000 ? 1000 : oldContent.length - 1).join("\n"),
        },
        new: {
          path: newPath,
          content: newContent.slice(0, oldContent.length > 1000 ? 1000 : oldContent.length - 1).join("\n"),
        },
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
  return commits.map((commit) => {
    return {
      message: commit.message(),
      sha: commit.sha(),
      date: commit.date(),
      author: commit.author().name(),
    };
  });
}
