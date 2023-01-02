import express from "express";
import type { Express, Request, Response } from "express";
import { config } from "./config";
import { createUser } from "./user.utils";
import { createRepo, removeRepo } from "./git/repository.utils";
import { getTree } from "./git/tree.utils";
import { getBlob } from "./git/blob.utils";
import { addKey, removeKey } from "./key.utils";

const app: Express = express();

app.use(express.json());

app.post("/api/users", async (req: Request, res: Response) => {
  const { username } = req.body;
  await createUser(username);

  res.send({ status: "ok" });
});

app.post("/api/repositories", async (req: Request, res: Response) => {
  const { username, repositoryName } = req.body;
  await createRepo(username, repositoryName);

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

app.listen(config.port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${config.port}`);
});
