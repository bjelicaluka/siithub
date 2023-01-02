import { Repository } from "nodegit";

const homePath = "/home";

export async function getBlob(username: string, repoName: string, branch: string, blobPath: string) {
  try {
    const repoPath = `${homePath}/${username}/${repoName}`;
    const repo = await Repository.open(repoPath + "/.git");
    const commit = await repo.getBranchCommit(branch);
    const treeEntry = await commit.getEntry(blobPath);
    if (treeEntry.isDirectory()) return null;
    const blob = await treeEntry.getBlob();
    return blob;
  } catch {
    return null;
  }
}
