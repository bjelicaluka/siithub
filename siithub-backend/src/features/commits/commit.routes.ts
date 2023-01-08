import { type Request, type Response, Router } from "express";
import "express-async-errors";
import { gitServerClient } from "../gitserver/gitserver.client";

const router = Router();

router.get("/:username/:repository/commits/:branch", async (req: Request, res: Response) => {
  const commits = await gitServerClient.getCommits(req.params.username, req.params.repository, req.params.branch);
  res.send(commits);
});

router.get("/:username/:repository/commit-count/:branch", async (req: Request, res: Response) => {
  const commits = await gitServerClient.getCommits(req.params.username, req.params.repository, req.params.branch);
  res.send({ count: commits.length });
});

router.get("/:username/:repository/commit/:sha", async (req: Request, res: Response) => {
  const commit = await gitServerClient.getCommit(req.params.username, req.params.repository, req.params.sha);
  res.send(commit);
});

export { router as commitRoutes };
