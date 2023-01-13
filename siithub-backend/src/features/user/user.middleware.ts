import type { NextFunction, Request, Response } from "express";
import { ForbiddenException } from "../../error-handling/errors";
import { getUserIdFromRequest } from "../auth/auth.utils";

async function modifyingOwnAccount(req: Request, _: Response, next: NextFunction) {
  const userId = req.params.id;
  const authorizedUserId = getUserIdFromRequest(req);

  if (userId?.toString() != authorizedUserId?.toString()) {
    throw new ForbiddenException("You are not authorized to change someone else's account.");
  }

  next();
}

export { modifyingOwnAccount };
