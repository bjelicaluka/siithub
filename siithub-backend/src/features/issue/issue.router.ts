import type { Request, Response } from "express";
import { Router } from "express";
import 'express-async-errors';
import { ObjectId } from 'mongodb';
import { issueService } from "./issue.service";
import { type IssueUpdate, type IssueCreate } from "./issue.model";

const router = Router();

router.get('/:id', async (req: Request, res: Response) => {
  const id = new ObjectId(req.params.id);
  res.send(await issueService.findOneOrThrow(id));
});

router.post('/', async (req: Request, res: Response) => {
  const issueCreate = req.body as IssueCreate;
  res.send(await issueService.create(issueCreate));
});

router.put('/', async (req: Request, res: Response) => {
  const issueUpdate = req.body as IssueUpdate;
  issueUpdate._id = new ObjectId(issueUpdate._id.toString());

  res.send(await issueService.update(issueUpdate));
});

export {
  router as issueRoutes
}