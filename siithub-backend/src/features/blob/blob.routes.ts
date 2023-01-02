import { Request, Response, Router } from "express";
import { getRepoIdFromPath } from "../../utils/getRepo";
import { gitServerClient } from "../gitserver/gitserver.client";

const router = Router();

router.get("/:username/:repository/blob/:branch/:blobPath", async (req: Request, res: Response) => {
  const repoId = await getRepoIdFromPath(req);
  const response = await gitServerClient.getBlob(
    req.params.username,
    req.params.repository,
    req.params.branch,
    req.params.blobPath
  );
  res.setHeader("bin", response.headers["bin"] + "").setHeader("size", response.headers["size"] + "");
  res.type("blob").send(response.data);
});

export { router as blobRoutes };
