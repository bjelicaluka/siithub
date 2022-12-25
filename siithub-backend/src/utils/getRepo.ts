import { repositoryService } from "../features/repository/repository.service";
import { type Request } from "express";
import { MissingEntityException } from "../error-handling/errors";

export async function getRepoIdFromPath(req: Request) {
  const repo = await repositoryService.findByOwnerAndName(req.params.username, req.params.repository);
  if (!repo) {
    throw new MissingEntityException("Repository not found");
  }
  return repo._id;
}