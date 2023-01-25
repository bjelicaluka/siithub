import { type Request, type Response, Router } from "express";
import { advanceSearchService } from "./advance-search.service";

import "express-async-errors";
import { objectIdString } from "../../utils/zod";
import { type Repository } from "../repository/repository.model";

const router = Router();

const idSchema = objectIdString("Invalid id");

router.get("/repositories", async (req: Request, res: Response) => {
  const param = req.query.param as string;

  res.send(await advanceSearchService.searchRepositories(param));
});

router.get("/repositories/count", async (req: Request, res: Response) => {
  const param = req.query.param as string;

  res.send({ count: await advanceSearchService.countRepositories(param) });
});

router.get("/users", async (req: Request, res: Response) => {
  const param = req.query.param as string;

  res.send(await advanceSearchService.searchUsers(param));
});

router.get("/users/count", async (req: Request, res: Response) => {
  const param = req.query.param as string;

  res.send({ count: await advanceSearchService.countUsers(param) });
});

router.get("/issues", async (req: Request, res: Response) => {
  const repositoryId = parseId(req.query.repositoryId as string);
  const param = req.query.param as string;

  res.send(await advanceSearchService.searchIssues(param, repositoryId));
});

router.get("/issues/count", async (req: Request, res: Response) => {
  const repositoryId = parseId(req.query.repositoryId as string);
  const param = req.query.param as string;

  res.send({ count: await advanceSearchService.countIssues(param, repositoryId) });
});

router.get("/commits", async (req: Request, res: Response) => {
  const repositoryId = parseId(req.query.repositoryId as string) as Repository["_id"];
  const param = req.query.param as string;

  res.send(await advanceSearchService.searchCommits(param, repositoryId));
});

router.get("/commits/count", async (req: Request, res: Response) => {
  const repositoryId = parseId(req.query.repositoryId as string) as Repository["_id"];
  const param = req.query.param as string;

  res.send({ count: await advanceSearchService.countCommits(param, repositoryId) });
});

router.get("/pull-requests", async (req: Request, res: Response) => {
  const repositoryId = parseId(req.query.repositoryId as string) as Repository["_id"];
  const param = req.query.param as string;

  res.send(await advanceSearchService.searchPullRequest(param, repositoryId));
});

router.get("/pull-requests/count", async (req: Request, res: Response) => {
  const repositoryId = parseId(req.query.repositoryId as string) as Repository["_id"];
  const param = req.query.param as string;

  res.send({ count: await advanceSearchService.countPullRequest(param, repositoryId) });
});

function parseId(param: string) {
  return param ? idSchema.parse(param) : undefined;
}

export { router as advanceSearchRoutes };
