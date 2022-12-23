import type { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { issueService } from "./issue.service";
import { ForbiddenException } from "../../error-handling/errors";

async function issueHasToBelongToRepo(req: Request, _: Response, next: NextFunction) {
  const id = new ObjectId(req.params.id || req.body._id);
  const repositoryId = new ObjectId(req.params.repositoryId);

  const issue = await issueService.findOne(id);
  if (issue?.repositoryId.toString() !== repositoryId.toString()) {
    throw new ForbiddenException("Issue does not belong to the given repository.");
  }

  next();
};

export { 
  issueHasToBelongToRepo
};