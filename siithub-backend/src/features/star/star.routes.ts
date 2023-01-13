import { type Request, type Response, Router } from "express";
import "express-async-errors";
import { getRepoIdFromPath } from "../../utils/getRepo";
import { getUserIdFromRequest } from "../auth/auth.utils";
import { userService } from "../user/user.service";
import { starService } from "./star.service";
import { authorize } from "../auth/auth.middleware";
import { isAllowedToAccessRepo } from "../collaborators/collaborators.middleware";

const router = Router();

router.get(
  "/:username/:repository/stargazers",
  authorize(),
  isAllowedToAccessRepo(true),
  async (req: Request, res: Response) => {
    const repositoryId = await getRepoIdFromPath(req);
    const stars = await starService.findByRepoId(repositoryId);
    res.send(await userService.findByIds(stars.map((s) => s.userId)));
  }
);

router.get(
  "/:username/:repository/star",
  authorize(),
  isAllowedToAccessRepo(true),
  async (req: Request, res: Response) => {
    const repositoryId = await getRepoIdFromPath(req);
    const userId = getUserIdFromRequest(req);
    res.send(await starService.findByUserIdAndRepoId(userId, repositoryId));
  }
);

router.post(
  "/:username/:repository/star",
  authorize(),
  isAllowedToAccessRepo(true),
  async (req: Request, res: Response) => {
    const repositoryId = await getRepoIdFromPath(req);
    const userId = getUserIdFromRequest(req);
    res.send(await starService.addStar(userId, repositoryId));
  }
);

router.delete(
  "/:username/:repository/star",
  authorize(),
  isAllowedToAccessRepo(true),
  async (req: Request, res: Response) => {
    const repositoryId = await getRepoIdFromPath(req);
    const userId = getUserIdFromRequest(req);
    res.send(await starService.removeStar(userId, repositoryId));
  }
);

export { router as starRoutes };
