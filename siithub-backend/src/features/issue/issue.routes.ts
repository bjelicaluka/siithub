import type { Request, Response } from "express";
import { Router } from "express";
import { issueService } from "./issue.service";
import { type IssueUpdate, type IssueCreate } from "./issue.model";
import "express-async-errors";
import { type IssuesQuery } from "./issue.query";
import { authorize } from "../auth/auth.middleware";
import { isAllowedToAccessRepo } from "../collaborators/collaborators.middleware";
import { z } from "zod";
import { objectIdString } from "../../utils/zod";

const router = Router();

const idSchema = objectIdString("Invalid id");
const localIdSchema = z.number().min(0);

router.get("/:repositoryId/issues/", authorize(), isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const repositoryId = idSchema.parse(req.params.repositoryId);
  res.send(await issueService.resolveParticipants(await issueService.findByRepositoryId(repositoryId)));
});

router.get(
  "/:repositoryId/issues/search",
  authorize(),
  isAllowedToAccessRepo(true),
  async (req: Request, res: Response) => {
    const repositoryId = idSchema.parse(req.params.repositoryId);
    const query = req.query as IssuesQuery;

    res.send(await issueService.resolveParticipants(await issueService.searchByQuery(query, repositoryId)));
  }
);

router.get(
  "/:repositoryId/issues/:localId",
  authorize(),
  isAllowedToAccessRepo(true),
  async (req: Request, res: Response) => {
    const repositoryId = idSchema.parse(req.params.repositoryId);
    const localId = localIdSchema.parse(+req.params.localId);
    res.send(
      (
        await issueService.resolveParticipants([await issueService.findByRepositoryIdAndLocalId(repositoryId, localId)])
      )[0]
    );
  }
);

router.post("/:repositoryId/issues/", authorize(), isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const repositoryId = idSchema.parse(req.params.repositoryId);
  const issueCreate = req.body as IssueCreate;
  issueCreate.repositoryId = repositoryId;
  res.send(await issueService.create(issueCreate));
});

router.put(
  "/:repositoryId/issues/:localId",
  authorize(),
  isAllowedToAccessRepo(true),
  async (req: Request, res: Response) => {
    const issueUpdate = req.body as IssueUpdate;

    issueUpdate.repositoryId = idSchema.parse(req.params.repositoryId);
    issueUpdate.localId = localIdSchema.parse(+req.params.localId);

    res.send(await issueService.update(issueUpdate));
  }
);

export { router as issueRoutes };
