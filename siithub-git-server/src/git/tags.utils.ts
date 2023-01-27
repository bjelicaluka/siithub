import { Repository } from "nodegit";
import { homePath } from "../config";

export async function createTag(username: string, repoName: string, tagName: string, target: string) {
  try {
    const repoPath = `${homePath}/${username}/${repoName}`;
    const repo = await Repository.open(repoPath + "/.git");

    const commit = await repo.getBranchCommit(target);
    const tag = await repo.createTag(commit.id(), tagName, "");

    return tag.name();
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function deleteTag(username: string, repoName: string, tagName: string) {
  try {
    const repoPath = `${homePath}/${username}/${repoName}`;
    const repo = await Repository.open(repoPath + "/.git");

    const tag = await repo.getTagByName(tagName);
    if (!tag) {
      return null;
    }

    await repo.deleteTagByName(tagName);
    return tag;
  } catch (e) {
    console.log(e);
    return null;
  }
}
