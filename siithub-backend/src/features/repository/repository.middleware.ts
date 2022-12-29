import type { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { ForbiddenException } from "../../error-handling/errors";
import { parseJWT } from "../../utils/jwt";
import { User } from "../user/user.model";
import { userService } from "../user/user.service";
import { repositoryService } from "./repository.service";

function authorizeRepositoryOwner() {
  return async function (req: Request, _: Response, next: NextFunction) {
    const autorization = req.headers["authorization"] || "";
    const token = autorization && autorization.split(" ")[1];
    const payload = parseJWT(token);

    let user: User | null = null;
    if (req.body.owner) {
      user = await userService.findByUsername(req.body.owner);
    }
    if (req.params.id) {
      const repository = await repositoryService.findOneOrThrow(new ObjectId(req.params.id));
      user = await userService.findByUsername(repository.owner);
    }

    if (payload.id !== user?._id.toString()) {
      throw new ForbiddenException("You are not authorized to delete someone else's repositories.");
    }

    next();
  };
}

export { authorizeRepositoryOwner };
