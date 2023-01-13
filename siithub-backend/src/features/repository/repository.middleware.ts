import type { NextFunction, Request, Response } from "express";
import { ForbiddenException } from "../../error-handling/errors";
import { getUserIdFromRequest } from "../auth/auth.utils";
import { userService } from "../user/user.service";

function authorizeRepositoryOwner() {
  return async function (req: Request, _: Response, next: NextFunction) {
    const userId = getUserIdFromRequest(req);

    let username: string = req.body.owner || req.params.username;
    let user = username ? await userService.findByUsername(username) : null;

    if (userId?.toString() !== user?._id.toString()) {
      throw new ForbiddenException("You are not authorized to access someone else's repository.");
    }

    next();
  };
}

export { authorizeRepositoryOwner };
