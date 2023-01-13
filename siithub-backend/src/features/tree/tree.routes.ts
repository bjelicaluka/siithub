import { type Request, type Response, Router } from "express";
import "express-async-errors";
import { getRepoIdFromPath } from "../../utils/getRepo";
import { gitServerClient } from "../gitserver/gitserver.client";

const router = Router();

router.get("/:username/:repository/tree/:branch/:treePath", async (req: Request, res: Response) => {
  const repoId = await getRepoIdFromPath(req);
  res.send(
    await gitServerClient.getTree(req.params.username, req.params.repository, req.params.branch, req.params.treePath)
  );
});

router.get("/:username/:repository/tree/:branch", async (req: Request, res: Response) => {
  const repoId = await getRepoIdFromPath(req);
  res.send(await gitServerClient.getTree(req.params.username, req.params.repository, req.params.branch, ""));
});

export { router as treeRoutes };
