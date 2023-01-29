import { type Request, type Response, Router } from "express";
import "express-async-errors";
import { getRepoIdFromPath } from "../../utils/getRepo";
import { commitService } from "./commit.service";

const router = Router();

router.get("/:username/:repository/commits/between", async (req: Request, res: Response) => {
  await getRepoIdFromPath(req);
  const { username, repository } = req.params as any;
  const { base, compare } = req.query as any;

  res.send(await commitService.getCommitsBetweenBranches(username, repository, base, compare));
});

router.get("/:username/:repository/commits/between/diff", async (req: Request, res: Response) => {
  await getRepoIdFromPath(req);
  const { username, repository } = req.params as any;
  const { base, compare } = req.query as any;

  res.send(await commitService.getCommitsDiffBetweenBranches(username, repository, base, compare));
});

router.get("/:username/:repository/commits/:branch", async (req: Request, res: Response) => {
  const repoId = await getRepoIdFromPath(req);
  res.send(await commitService.getCommits(req.params.username, req.params.repository, req.params.branch));
});

router.get("/:username/:repository/commits/:branch/with-diff", async (req: Request, res: Response) => {
  const repoId = await getRepoIdFromPath(req);
  res.send(await commitService.getCommitsWithDiff(req.params.username, req.params.repository, req.params.branch));
});

router.get("/:username/:repository/commits/:branch/:filePath", async (req: Request, res: Response) => {
  const repoId = await getRepoIdFromPath(req);
  res.send(
    await commitService.getFileHistoryCommits(
      req.params.username,
      req.params.repository,
      req.params.branch,
      req.params.filePath
    )
  );
});

router.get("/:username/:repository/commit-count/:branch", async (req: Request, res: Response) => {
  const repoId = await getRepoIdFromPath(req);
  res.send(await commitService.getCommitCount(req.params.username, req.params.repository, req.params.branch));
});

router.get("/:username/:repository/commit/:sha", async (req: Request, res: Response) => {
  const repoId = await getRepoIdFromPath(req);
  res.send(await commitService.getCommit(req.params.username, req.params.repository, req.params.sha));
});

router.get("/:username/:repository/blob-info/:branch/:blobPath", async (req: Request, res: Response) => {
  const repoId = await getRepoIdFromPath(req);
  res.send(
    await commitService.getFileInfo(req.params.username, req.params.repository, req.params.branch, req.params.blobPath)
  );
});

export { router as commitRoutes };
