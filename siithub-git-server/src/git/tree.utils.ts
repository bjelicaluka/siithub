import { Commit, Repository, Revwalk } from "nodegit";
import { homePath } from "../config";
import { isCommitSha } from "../string.utils";

export async function getTree(username: string, repoName: string, branch: string, treePath: string) {
  try {
    const repoPath = `${homePath}/${username}/${repoName}`;
    const repo = await Repository.open(repoPath + "/.git");
    const commit = await (isCommitSha(branch) ? repo.getCommit(branch) : repo.getBranchCommit(branch));
    let tree = await commit.getTree();
    if (treePath) {
      const treeEntry = await tree.getEntry(treePath);
      if (treeEntry.isFile()) return null;
      tree = await treeEntry.getTree();
    }
    return await Promise.all(
      tree.entries().map(async (e) => ({
        name: e.name(),
        path: e.path(),
        isFolder: e.isDirectory(),
        commit: await getLatestCommit(repo, commit, e.path()),
      }))
    );
  } catch {
    return null;
  }
}

async function getLatestCommit(repo: Repository, headCommit: Commit, treePath: string) {
  const walker = repo.createRevWalk();
  walker.push(headCommit.id());
  walker.sorting(Revwalk.SORT.TIME);
  let history = await walker.fileHistoryWalk(treePath, 100);
  if (!history.length) return {};
  const commit = history[0].commit;
  return {
    message: commit.message(),
    sha: commit.sha(),
    date: commit.date(),
    author: { name: commit.author().name(), email: commit.author().email() },
  };
}
