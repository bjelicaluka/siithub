import { Request } from "express";
import { ObjectId } from "mongodb";
import { ForbiddenException } from "../../error-handling/errors";
import { parseJWT } from "../../utils/jwt";
import { clearPropertiesOfObject } from "../../utils/wrappers";
import { type User } from "../user/user.model";

function removePassword(user: User) {
  return clearPropertiesOfObject(user, 'passwordAccount');
}

function getUserIdFromRequest(req: Request): ObjectId {
  const autorization = req.headers['authorization'] || '';  
  const token = autorization && autorization.split(' ')[1];
  if (!token) {
    throw new ForbiddenException("You are missing the authorization token.");
  }
  const payload = parseJWT(token);
  if (!payload?.id) {
    throw new ForbiddenException("You are missing the authorization token.");
  }
  return new ObjectId(payload.id);
}

export {
  removePassword,
  getUserIdFromRequest
}