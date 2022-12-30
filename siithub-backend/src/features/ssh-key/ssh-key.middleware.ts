import type { NextFunction, Request, Response } from "express";
import { ForbiddenException } from "../../error-handling/errors";
import { parseJWT } from "../../utils/jwt";
import { User } from "../user/user.model";
import { userService } from "../user/user.service";
import { sshKeyService } from "./ssh-key.service";

function authorizeSshKeyOwner() {
  return async function (req: Request, _: Response, next: NextFunction) {
    const autorization = req.headers["authorization"] || "";
    const token = autorization && autorization.split(" ")[1];
    const payload = parseJWT(token);

    let user: User | null = null;
    if (req.body.owner) {
      user = await userService.findByUsername(req.body.owner);
    }
    if (req.params.id) {
      const sshKey = await sshKeyService.findOneOrThrow(req.params.id);
      user = await userService.findByUsername(sshKey.owner);
    }

    if (payload.id !== user?._id.toString()) {
      throw new ForbiddenException("You are not authorized to set up someone else's keys.");
    }

    next();
  };
}

export { authorizeSshKeyOwner };
