import express from "express";
import type { Express, Request, Response } from "express";
import { config } from "./config";
import { createUser } from "./user.utils";
import { createRepo, removeRepo } from "./git/repository.utils";
import { getTree } from "./git/tree.utils";
import { getBlob } from "./git/blob.utils";
import { addKey, removeKey } from "./key.utils";
import { addUserToGroup, deleteUserFromGroup } from "./git/group.utils";
import { createBranch, getBranches, removeBranch, renameBranch } from "./git/branches.utils";
import { getCommit, getCommitCount, getCommits, getFileHistoryCommits, getLatestCommit } from "./git/commits";
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

app.post("/api/repositories/:repository/collaborators", async (req: Request, res: Response) => {
  const { repository } = req.params;
  const { collaborator } = req.body;

  await addUserToGroup(repository, collaborator);

  res.send({ status: "ok" });
});

app.delete("/api/repositories/:repository/collaborators/:collaborator", async (req: Request, res: Response) => {
  const { repository, collaborator } = req.params;

  await deleteUserFromGroup(repository, collaborator);

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

app.get("/api/commits/:username/:repository/:branch/", async (req: Request, res: Response) => {
  const commits = await getCommits(req.params.username, req.params.repository, req.params.branch);
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

app.listen(config.port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${config.port}`);

  execCmd("sh -c rc-status; rc-service sshd start")
    .then(() => console.log("SSH started"))
    .catch(console.log);
});
