import type { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { labelService } from "./label.service";
import { ForbiddenException } from "../../error-handling/errors";

async function labelHasToBelongToRepo(req: Request, _: Response, next: NextFunction) {
  const id = new ObjectId(req.params.id) as any;
  const repositoryId = req.params.repositoryId as any;

  const label = await labelService.findOne(id);
  if (label?.repositoryId !== repositoryId) {
    throw new ForbiddenException("Label does not belong to the given repository.");
  }

  next();
};

export { 
  labelHasToBelongToRepo
};