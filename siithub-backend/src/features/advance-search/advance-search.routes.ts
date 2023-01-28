import { type Request, type Response, Router } from "express";
import { advanceSearchService } from "./advance-search.service";

import "express-async-errors";
import { objectIdString } from "../../utils/zod";
import { type Repository } from "../repository/repository.model";
import { getUserIdFromRequest } from "../auth/auth.utils";

const router = Router();

const idSchema = objectIdString("Invalid id");

router.get("/repositories", async (req: Request, res: Response) => {
  const param = req.query.param as string;
  const sort = req.query.sort ? JSON.parse(req.query.sort as string) : (undefined as any);
  const userId = getUserIdFromRequest(req);

  res.send(await advanceSearchService.searchRepositories(param, userId, sort));
});

router.get("/repositories/count", async (req: Request, res: Response) => {
  const param = req.query.param as string;
  const userId = getUserIdFromRequest(req);

  res.send({ count: await advanceSearchService.countRepositories(param, userId) });
});

router.get("/users", async (req: Request, res: Response) => {
  const param = req.query.param as string;
  const sort = req.query.sort ? JSON.parse(req.query.sort as string) : (undefined as any);

  res.send(await advanceSearchService.searchUsers(param, sort));
});

router.get("/users/count", async (req: Request, res: Response) => {
  const param = req.query.param as string;

  res.send({ count: await advanceSearchService.countUsers(param) });
});

router.get("/tags", async (req: Request, res: Response) => {
  const repositoryId = parseId(req.query.repositoryId as string);
  const param = req.query.param as string;
  const sort = req.query.sort ? JSON.parse(req.query.sort as string) : (undefined as any);
  const userId = getUserIdFromRequest(req);

  res.send(await advanceSearchService.searchTags(param, userId, repositoryId, sort));
});

router.get("/tags/count", async (req: Request, res: Response) => {
  const repositoryId = parseId(req.query.repositoryId as string);
  const param = req.query.param as string;
  const userId = getUserIdFromRequest(req);

  res.send({ count: await advanceSearchService.countTags(param, userId, repositoryId) });
});

router.get("/issues", async (req: Request, res: Response) => {
  const repositoryId = parseId(req.query.repositoryId as string);
  const param = req.query.param as string;
  const sort = req.query.sort ? JSON.parse(req.query.sort as string) : (undefined as any);
  const userId = getUserIdFromRequest(req);

  res.send(await advanceSearchService.searchIssues(param, userId, repositoryId, sort));
});

router.get("/issues/count", async (req: Request, res: Response) => {
  const repositoryId = parseId(req.query.repositoryId as string);
  const param = req.query.param as string;
  const userId = getUserIdFromRequest(req);

  res.send({ count: await advanceSearchService.countIssues(param, userId, repositoryId) });
});

router.get("/commits", async (req: Request, res: Response) => {
  const repositoryId = parseId(req.query.repositoryId as string) as Repository["_id"];
  const param = req.query.param as string;
  const sort = req.query.sort ? JSON.parse(req.query.sort as string) : (undefined as any);

  res.send(await advanceSearchService.searchCommits(param, repositoryId, sort));
});

router.get("/commits/count", async (req: Request, res: Response) => {
  const repositoryId = parseId(req.query.repositoryId as string) as Repository["_id"];
  const param = req.query.param as string;
  const userId = getUserIdFromRequest(req);

  res.send({ count: await advanceSearchService.countCommits(param, repositoryId) });
});

router.get("/pull-requests", async (req: Request, res: Response) => {
  const repositoryId = parseId(req.query.repositoryId as string) as Repository["_id"];
  const param = req.query.param as string;
  const sort = req.query.sort ? JSON.parse(req.query.sort as string) : (undefined as any);
  const userId = getUserIdFromRequest(req);

  res.send(await advanceSearchService.searchPullRequest(param, userId, repositoryId, sort));
});

router.get("/pull-requests/count", async (req: Request, res: Response) => {
  const repositoryId = parseId(req.query.repositoryId as string) as Repository["_id"];
  const param = req.query.param as string;
  const userId = getUserIdFromRequest(req);

  res.send({ count: await advanceSearchService.countPullRequest(param, userId, repositoryId) });
});

function parseId(param: string) {
  return param ? idSchema.parse(param) : undefined;
}

export { router as advanceSearchRoutes };
