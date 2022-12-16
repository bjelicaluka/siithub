import { NextFunction, Request, Response } from "express";
import { ForbiddenException } from "../../error-handling/errors";
import { parseJWT } from "../../utils/jwt";
import { type UserType } from "../user/user.model";

function authorize(...types: UserType[]) {
  return async function(req: Request, res: Response, next: NextFunction) {
    const autorization = req.headers['authorization'] || '';  
    const token = autorization && autorization.split(' ')[1];
    if (!token) {
      throw new ForbiddenException("You are missing the authorization token.");
    }
  
    const payload = parseJWT(token);
    if (types.length && !types.includes(payload.type)) {
      throw new ForbiddenException("You are not authorized to perform this action.");
    }
  
    next();
  }  
}

export {
  authorize
}