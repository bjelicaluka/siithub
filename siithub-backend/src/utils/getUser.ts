import { type Request } from "express";
import { userService } from "../features/user/user.service";

export async function getUserIdFromPath(req: Request) {
  const user = await userService.findByUsernameOrThrow(req.params.username);
  return user._id;
}
