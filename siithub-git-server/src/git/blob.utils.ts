import { Repository } from "nodegit";
import { homePath } from "../config";
import { isCommitSha } from "../string.utils";

export async function getBlob(username: string, repoName: string, branch: string, blobPath: string) {
  try {
    const repoPath = `${homePath}/${username}/${repoName}`;
    const repo = await Repository.open(repoPath + "/.git");
    const commit = await (isCommitSha(branch) ? repo.getCommit(branch) : repo.getBranchCommit(branch));
    const treeEntry = await commit.getEntry(blobPath);
    if (treeEntry.isDirectory()) return null;
    const blob = await treeEntry.getBlob();
    return blob;
  } catch {
    return null;
  }
}
