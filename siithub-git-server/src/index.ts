import express from "express";
import type { Express, Request, Response } from "express";
import { config } from "./config";
import { createUser } from "./user.utils";
import { createRepo, removeRepo } from "./git/repository.utils";
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

app.listen(config.port, () => {
  console.log(
    `⚡️[server]: Server is running at https://localhost:${config.port}`
  );
});
