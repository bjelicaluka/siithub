import type { NextFunction, Request, Response } from "express";
import { Repository } from "../repository/repository.model";
import { repositoryRepo } from "../repository/repository.repo";
import { ForbiddenException } from "../../error-handling/errors";
import { collaboratorsService } from "./collaborators.service";
import { getUserIdFromRequest } from "../auth/auth.utils";
import { userRepo } from "../user/user.repo";
import { ObjectId } from "mongodb";

export function isAllowedToAccessRepo(allowPublicAccess: boolean = false) {
  return async function (req: Request, _: Response, next: NextFunction) {
    const repository = await getRepository(req.params);
    if (!repository) {
      throw new ForbiddenException("Repository does not exist.");
    }

    if (allowPublicAccess && repository.type === "public") {
      next();
      return;
    }

    const userId = getUserIdFromRequest(req);
    const user = await userRepo.crud.findOne(userId);
    if (user?.username === repository.owner) {
      next();
      return;
    }

    const canAccessRepo = !!(await collaboratorsService.findByRepositoryAndUser(repository._id, userId));
    if (!canAccessRepo) {
      throw new ForbiddenException("You are not collaborating on the repository.");
    }
    next();
  };
}

async function getRepository(params: any): Promise<Repository | null> {
  const { username, repository, repositoryId } = params;

  if (repositoryId) {
    return await repositoryRepo.crud.findOne(new ObjectId(repositoryId));
  } else {
    return await repositoryRepo.findByOwnerAndName(username, repository);
  }
}
