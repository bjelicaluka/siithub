import type { Request, Response } from "express";
import { Router } from "express";
import { ObjectId } from 'mongodb';
import { issueService } from "./issue.service";
import { type IssueUpdate, type IssueCreate } from "./issue.model";
import 'express-async-errors';
import { type IssuesQuery } from "./issue.query";
import { issueHasToBelongToRepo } from "./issue.middlewares";

const router = Router();

router.get('/:repositoryId/issues/', async (req: Request, res: Response) => {
  const repositoryId = new ObjectId(req.params.repositoryId);
  res.send(await issueService.findByRepositoryId(repositoryId));
});

router.post('/:repositoryId/issues/search', async (req: Request, res: Response) => {
  const repositoryId = new ObjectId(req.params.repositoryId);
  const query = req.body as IssuesQuery;

  res.send(await issueService.searchByQuery(query, repositoryId));
});

router.get('/:repositoryId/issues/:id', issueHasToBelongToRepo, async (req: Request, res: Response) => {
  const id = new ObjectId(req.params.id);

  res.send(await issueService.findOneOrThrow(id));
});

router.post('/:repositoryId/issues/', async (req: Request, res: Response) => {
  const issueCreate = req.body as IssueCreate;
  const repositoryId = new ObjectId(req.params.repositoryId);
  issueCreate.repositoryId = repositoryId;

  res.send(await issueService.create(issueCreate));
});

router.put('/:repositoryId/issues/', issueHasToBelongToRepo, async (req: Request, res: Response) => {
  const issueUpdate = req.body as IssueUpdate;
  issueUpdate._id = new ObjectId(issueUpdate._id.toString());

  res.send(await issueService.update(issueUpdate));
});

export {
  router as issueRoutes
}