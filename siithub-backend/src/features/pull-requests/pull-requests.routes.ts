import type { Request, Response } from "express";
import { Router } from "express";
import "express-async-errors";
import { objectIdString } from "../../utils/zod";
import { z } from "zod";
import { type PullRequestCreate, PullRequestUpdate } from "./pull-requests.model";
import { pullRequestService } from "./pull-requests.service";
// import { authorize } from "../auth/auth.middleware";
// import { isAllowedToAccessRepo } from "../collaborators/collaborators.middleware";
// TODO: Add those later

const router = Router();

const idSchema = objectIdString("Invalid id");
const localIdSchema = z.number().min(0);

router.get("/:repositoryId/pull-requests/", async (req: Request, res: Response) => {
  const repositoryId = idSchema.parse(req.params.repositoryId);
  res.send(await pullRequestService.findByRepositoryId(repositoryId));
});

router.get("/:repositoryId/pull-requests/:localId", async (req: Request, res: Response) => {
  const repositoryId = idSchema.parse(req.params.repositoryId);
  const localId = localIdSchema.parse(+req.params.localId);
  res.send(await pullRequestService.findByRepositoryIdAndLocalId(repositoryId, localId));
});

router.post("/:repositoryId/pull-requests/", async (req: Request, res: Response) => {
  const repositoryId = idSchema.parse(req.params.repositoryId);
  const pullRequestCreate = req.body as PullRequestCreate;
  pullRequestCreate.repositoryId = repositoryId;

  res.send(await pullRequestService.create(pullRequestCreate));
});

router.put("/:repositoryId/pull-requests/:localId", async (req: Request, res: Response) => {
  const pullRequestUpdate = req.body as PullRequestUpdate;

  pullRequestUpdate.repositoryId = idSchema.parse(req.params.repositoryId);
  pullRequestUpdate.localId = localIdSchema.parse(+req.params.localId);

  res.send(await pullRequestService.update(pullRequestUpdate));
});

export { router as pullRequestRoutes };
