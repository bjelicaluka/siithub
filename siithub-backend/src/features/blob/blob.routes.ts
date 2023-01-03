import { type Request, type Response, Router } from "express";
import "express-async-errors";
import { getRepoIdFromPath } from "../../utils/getRepo";
import { gitServerClient } from "../gitserver/gitserver.client";

const router = Router();

router.get("/:username/:repository/blob/:branch/:blobPath", async (req: Request, res: Response) => {
  const repoId = await getRepoIdFromPath(req);
  const blob = await gitServerClient.getBlob(
    req.params.username,
    req.params.repository,
    req.params.branch,
    req.params.blobPath
  );
  const { size, bin, data } = blob;
  res.setHeader("bin", bin).setHeader("size", size).type("blob").send(data);
});

export { router as blobRoutes };
