import { type Request, type Response, Router } from "express";
import "express-async-errors";
import { z } from "zod";
import { authorize } from "../auth/auth.middleware";
import { isAllowedToAccessRepo } from "../collaborators/collaborators.middleware";
import { tagsService } from "./tags.service";
import { type TagCreate } from "./tags.model";
import { ALPHANUMERIC_AND_WHITESPACE_REGEX } from "../../patterns";
import { getUserIdFromRequest } from "../auth/auth.utils";
import { getRepoIdFromPath } from "../../utils/getRepo";

const router = Router();

const tagBodySchema = z.object({
  name: z
    .string()
    .min(3, "Name should have at least 3 characters.")
    .regex(ALPHANUMERIC_AND_WHITESPACE_REGEX, "Name should contain only alphanumeric characters."),
  description: z.string().default(""),
  version: z.string().min(1, "Version should be provided."),
  branch: z.string().min(1),
  isLatest: z.boolean().default(false),
  isPreRelease: z.boolean().default(false),
});

router.get(
  "/:username/:repository/tags",
  authorize(),
  isAllowedToAccessRepo(true),
  async (req: Request, res: Response) => {
    const repositoryId = await getRepoIdFromPath(req);
    const name = req.query?.name?.toString() ?? "";

    res.send(await tagsService.searchByNameAndRepositoryId(name, repositoryId));
  }
);

router.get(
  "/:username/:repository/tags/count",
  authorize(),
  isAllowedToAccessRepo(true),
  async (req: Request, res: Response) => {
    const repositoryId = await getRepoIdFromPath(req);
    res.send({ count: await tagsService.countByRepositoryId(repositoryId) });
  }
);

router.post(
  "/:username/:repository/tags",
  authorize(),
  isAllowedToAccessRepo(),
  async (req: Request, res: Response) => {
    const createTag = tagBodySchema.parse(req.body);

    const tag: TagCreate = {
      ...createTag,
      repositoryId: await getRepoIdFromPath(req),
      author: getUserIdFromRequest(req),
      timeStamp: new Date(),
    };

    res.send(await tagsService.create(tag));
  }
);

router.delete(
  "/:username/:repository/tags/:version",
  authorize(),
  isAllowedToAccessRepo(),
  async (req: Request, res: Response) => {
    const repositoryId = await getRepoIdFromPath(req);
    const { version } = req.params;

    res.send(await tagsService.delete(version, repositoryId));
  }
);

export { router as tagsRoutes };
