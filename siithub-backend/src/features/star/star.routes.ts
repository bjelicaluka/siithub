import { type Request, type Response, Router } from "express";
import "express-async-errors";
import { getRepoIdFromPath } from "../../utils/getRepo";
import { getUserIdFromRequest } from "../auth/auth.utils";
import { userService } from "../user/user.service";
import { starService } from "./star.service";

const router = Router();

router.get("/:username/:repository/star", async (req: Request, res: Response) => {
  const repositoryId = await getRepoIdFromPath(req);
  const userId = getUserIdFromRequest(req);
  res.send(await starService.findByUserIdAndRepoId(userId, repositoryId));
});

router.post("/:username/:repository/star", async (req: Request, res: Response) => {
  const repositoryId = await getRepoIdFromPath(req);
  const userId = getUserIdFromRequest(req);
  res.send(await starService.addStar(userId, repositoryId));
});

router.delete("/:username/:repository/star", async (req: Request, res: Response) => {
  const repositoryId = await getRepoIdFromPath(req);
  const userId = getUserIdFromRequest(req);
  res.send(await starService.removeStar(userId, repositoryId));
});

router.get("/:username/:repository/stargazers", async (req: Request, res: Response) => {
  const repositoryId = await getRepoIdFromPath(req);
  const stars = await starService.findByRepoId(repositoryId);
  res.send(await userService.findByIds(stars.map((s) => s.userId)));
});

export { router as starRoutes };
