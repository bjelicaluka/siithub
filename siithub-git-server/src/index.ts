import express from "express";
import type { Express, Request, Response } from "express";
import { config } from "./config";
import { createUser } from "./user.utils";
import { createRepo, createRepoFork, removeRepo } from "./git/repository.utils";
import { getTree } from "./git/tree.utils";
import { getBlob } from "./git/blob.utils";
import { addKey, removeKey } from "./key.utils";
import { addUserToGroup, deleteUserFromGroup } from "./git/group.utils";
import { createBranch, getBranches, removeBranch, renameBranch } from "./git/branches.utils";
import { createTag, deleteTag } from "./git/tags.utils";
import {
  getCommit,
  getCommitCount,
  getCommits,
  getCommitsBetweenBranches,
  getCommitsDiffBetweenBranches,
  getCommitsSha,
  getFileHistoryCommits,
  getLatestCommit,
  mergeCommits,
} from "./git/commits";
import { execCmd } from "./cmd.utils";

const app: Express = express();

app.use(express.json());

app.post("/api/users", async (req: Request, res: Response) => {
  const { username } = req.body;
  await createUser(username);

  res.send({ status: "ok" });
});

app.post("/api/repositories", async (req: Request, res: Response) => {
  const { username, repositoryName, type } = req.body;
  await createRepo(username, repositoryName, type === "public");

  res.send({ status: "ok" });
});

app.post("/api/repositories/fork", async (req: Request, res: Response) => {
  const { username, repositoryName, fromUsername, fromRepositoryName, type, only1Branch } = req.body;
  await createRepoFork(username, repositoryName, fromUsername, fromRepositoryName, type === "public", only1Branch);

  res.send({ status: "ok" });
});

app.put("/api/repositories/delete", async (req: Request, res: Response) => {
  const { username, repositoryName } = req.body;
  await removeRepo(username, repositoryName);

  res.send({ status: "ok" });
});

app.post("/api/key", async (req: Request, res: Response) => {
  const { username, key } = req.body;
  await addKey(username, key);

  res.send({ status: "ok" });
});

app.put("/api/key", async (req: Request, res: Response) => {
  const { username, key, oldKey } = req.body;
  await removeKey(username, oldKey);
  await addKey(username, key);

  res.send({ status: "ok" });
});

app.put("/api/key/delete", async (req: Request, res: Response) => {
  const { username, key } = req.body;
  await removeKey(username, key);

  res.send({ status: "ok" });
});

app.get("/api/tree/:username/:repository/:branch/:treePath", async (req: Request, res: Response) => {
  const tree = await getTree(req.params.username, req.params.repository, req.params.branch, req.params.treePath);
  if (!tree) {
    res.status(404).send({ m: "not found" });
    return;
  }
  res.send(tree);
});

app.get("/api/tree/:username/:repository/:branch/", async (req: Request, res: Response) => {
  const tree = await getTree(req.params.username, req.params.repository, req.params.branch, "");
  if (!tree) {
    res.status(404).send({ m: "root not found" });
    return;
  }
  res.send(tree);
});

app.get("/api/blob/:username/:repository/:branch/:blobPath", async (req: Request, res: Response) => {
  const blob = await getBlob(req.params.username, req.params.repository, req.params.branch, req.params.blobPath);
  if (!blob) {
    res.status(404).send({ m: "file not found" });
    return;
  }
  res.setHeader("bin", blob.isBinary()).setHeader("size", blob.rawsize());
  res.type("blob").send(blob.content());
});

app.get("/api/blob-info/:username/:repository/:branch/:blobPath", async (req: Request, res: Response) => {
  const info = await getLatestCommit(
    req.params.username,
    req.params.repository,
    req.params.branch,
    req.params.blobPath
  );
  if (!info) {
    res.status(404).send({ m: "file not found" });
    return;
  }
  res.send(info);
});

app.post("/api/collaborators/:username/:repository", async (req: Request, res: Response) => {
  const { username, repository } = req.params;
  const { collaborator } = req.body;

  await addUserToGroup(`${username}-${repository}`, collaborator);

  res.send({ status: "ok" });
});

app.delete("/api/collaborators/:username/:repository/:collaborator", async (req: Request, res: Response) => {
  const { username, repository, collaborator } = req.params;

  await deleteUserFromGroup(`${username}-${repository}`, collaborator);

  res.send({ status: "ok" });
});

app.get("/api/branches/:username/:repository", async (req: Request, res: Response) => {
  const { username, repository } = req.params;

  const branches = await getBranches(username, repository);
  if (!branches) {
    res.status(400).send({ message: "Error while trying to fetch branches." });
    return;
  }
  res.send(branches);
});

app.post("/api/branches/:username/:repository", async (req: Request, res: Response) => {
  const { username, repository } = req.params;
  const { source, branchName } = req.body;

  const createdBranch = await createBranch(username, repository, source, branchName);
  if (!createdBranch) {
    res.status(400).send({ message: "Branch already exists." });
    return;
  }
  res.send(createdBranch);
});

app.put("/api/branches/:username/:repository/:branchName", async (req: Request, res: Response) => {
  const { username, repository, branchName } = req.params;
  const { newBranchName } = req.body;

  const renamedBranch = await renameBranch(username, repository, branchName, newBranchName);
  if (renamedBranch === null) {
    res.status(404).send({ message: `Branch ${branchName} not found.` });
    return;
  }
  res.send(renamedBranch);
});

app.delete("/api/branches/:username/:repository/:branchName", async (req: Request, res: Response) => {
  const { username, repository, branchName } = req.params;

  const deletedBranch = await removeBranch(username, repository, branchName);
  if (deletedBranch === null) {
    res.status(404).send({ message: `Branch ${branchName} not found.` });
    return;
  }
  res.send(deletedBranch);
});

app.get("/api/commits/:username/:repository/between", async (req: Request, res: Response) => {
  const { username, repository } = req.params;
  const { base, compare } = req.query;

  const commits = await getCommitsBetweenBranches(
    username,
    repository,
    base?.toString() ?? "",
    compare?.toString() ?? ""
  );
  if (!commits) {
    res.status(404).send({ m: "commits not found" });
    return;
  }
  res.send(commits);
});

app.get("/api/commits/:username/:repository/diff/between", async (req: Request, res: Response) => {
  const { username, repository } = req.params;
  const { base, compare } = req.query;

  const commits = await getCommitsDiffBetweenBranches(
    username,
    repository,
    base?.toString() ?? "",
    compare?.toString() ?? ""
  );
  if (!commits) {
    res.status(404).send({ m: "commits not found" });
    return;
  }
  res.send(commits);
});

app.get("/api/commits/:username/:repository/:branch/", async (req: Request, res: Response) => {
  const commits = await getCommits(req.params.username, req.params.repository, req.params.branch);
  if (!commits) {
    res.status(404).send({ m: "commits not found" });
    return;
  }
  res.send(commits);
});

app.get("/api/commits/:username/:repository/:branch/with-diff", async (req: Request, res: Response) => {
  const commits = await getCommits(req.params.username, req.params.repository, req.params.branch, true);
  if (!commits) {
    res.status(404).send({ m: "commits not found" });
    return;
  }
  res.send(commits);
});

app.get("/api/commits/:username/:repository/:branch/:filePath", async (req: Request, res: Response) => {
  const { username, repository, branch, filePath } = req.params;
  const commits = await getFileHistoryCommits(username, repository, branch, filePath);
  if (!commits) {
    res.status(404).send({ m: "commits not found" });
    return;
  }
  res.send(commits);
});

app.get("/api/commit-count/:username/:repository/:branch/", async (req: Request, res: Response) => {
  const count = await getCommitCount(req.params.username, req.params.repository, req.params.branch);
  if (!count) {
    res.status(404).send({ m: "commits not found" });
    return;
  }
  res.send({ count });
});

app.get("/api/commit/:username/:repository/:sha/", async (req: Request, res: Response) => {
  const commit = await getCommit(req.params.username, req.params.repository, req.params.sha);
  if (!commit) {
    res.status(404).send({ m: "commit not found" });
    return;
  }
  res.send(commit);
});

app.get("/api/commit/sha/:username/:repository/:branch", async (req: Request, res: Response) => {
  const { username, repository, branch } = req.params;

  const sha = await getCommitsSha(username, repository, branch);
  if (!sha) {
    res.status(404).send({ m: "Sha does not exist" });
    return;
  }
  res.send(sha);
});

app.post("/api/commits/merge/:username/:repository", async (req: Request, res: Response) => {
  const { username, repository } = req.params;
  const { base, compare } = req.query as any;

  const mergeResult = await mergeCommits(username, repository, base, compare);
  if (!mergeResult) {
    res.status(400).send({ m: "Merge conflict" });
    return;
  }
  res.send(mergeResult);
});

app.post("/api/tags/:username/:repository", async (req: Request, res: Response) => {
  const { username, repository } = req.params;
  const { tagName, target } = req.body as any;
  const tag = await createTag(username, repository, tagName, target);

  if (!tag) {
    res.status(400).send({ m: "Tag not created" });
    return;
  }
  res.send(tag);
});

app.delete("/api/tags/:username/:repository/:tagName", async (req: Request, res: Response) => {
  const { username, repository, tagName } = req.params;
  const tag = await deleteTag(username, repository, tagName);

  if (!tag) {
    res.status(404).send({ m: "Tag does not exit" });
    return;
  }
  res.send(tag);
});

app.listen(config.port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${config.port}`);

  execCmd("sh -c rc-status; rc-service sshd start")
    .then(() => console.log("SSH started"))
    .catch(console.log);
});
