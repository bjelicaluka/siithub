import express, { Express, Request, Response } from "express";
import { config } from "./config";
import { createUser } from "./user.utils";

const app: Express = express();

app.use(express.json());

app.post("/api/create-user", async(req: Request, res: Response) => {
  const { username } = req.body;
  await createUser(username);

  res.send({ status: 'ok' })
})

app.listen(config.port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${config.port}`);
});
