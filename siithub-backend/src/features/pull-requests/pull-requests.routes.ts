import type { Request, Response } from "express";
import { Router } from "express";
import "express-async-errors";
import { objectIdString } from "../../utils/zod";
import { z } from "zod";
import { type PullRequestCreate, type PullRequestUpdate } from "./pull-requests.model";
import { type PullRequestsQuery } from "./pull-requests.query";
import { pullRequestService } from "./pull-requests.service";
import { authorize } from "../auth/auth.middleware";
import { isAllowedToAccessRepo } from "../collaborators/collaborators.middleware";

const router = Router();

const idSchema = objectIdString("Invalid id");
const localIdSchema = z.number().min(0);

router.get(
  "/:repositoryId/pull-requests/",
  authorize(),
  isAllowedToAccessRepo(true),
  async (req: Request, res: Response) => {
    const repositoryId = idSchema.parse(req.params.repositoryId);

    const pullRequests = await pullRequestService.findByRepositoryId(repositoryId);
    res.send(await pullRequestService.resolveParticipants(pullRequests));
  }
);

router.get(
  "/:repositoryId/pull-requests/search",
  authorize(),
  isAllowedToAccessRepo(true),
  async (req: Request, res: Response) => {
    const repositoryId = idSchema.parse(req.params.repositoryId);
    const query = req.query as PullRequestsQuery;

    const pullRequests = await pullRequestService.searchByQuery(query, repositoryId);
    res.send(await pullRequestService.resolveParticipants(pullRequests));
  }
);

router.get(
  "/:repositoryId/pull-requests/:localId",
  authorize(),
  isAllowedToAccessRepo(true),
  async (req: Request, res: Response) => {
    const repositoryId = idSchema.parse(req.params.repositoryId);
    const localId = localIdSchema.parse(+req.params.localId);

    const pullRequest = await pullRequestService.findByRepositoryIdAndLocalId(repositoryId, localId);
    res.send((await pullRequestService.resolveParticipants([pullRequest]))[0]);
  }
);

router.post(
  "/:repositoryId/pull-requests/",
  authorize(),
  isAllowedToAccessRepo(true),
  async (req: Request, res: Response) => {
    const repositoryId = idSchema.parse(req.params.repositoryId);
    const pullRequestCreate = req.body as PullRequestCreate;
    pullRequestCreate.repositoryId = repositoryId;

    res.send(await pullRequestService.create(pullRequestCreate));
  }
);

router.put(
  "/:repositoryId/pull-requests/:localId",
  authorize(),
  isAllowedToAccessRepo(true),
  async (req: Request, res: Response) => {
    const pullRequestUpdate = req.body as PullRequestUpdate;

    pullRequestUpdate.repositoryId = idSchema.parse(req.params.repositoryId);
    pullRequestUpdate.localId = localIdSchema.parse(+req.params.localId);

    res.send(await pullRequestService.update(pullRequestUpdate));
  }
);

export { router as pullRequestRoutes };
