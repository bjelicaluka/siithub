import { type Request, type Response, Router } from "express";
import { z } from "zod";
import type { MilestoneCreate, MilestoneUpdate } from "./milestone.model";
import { milestoneService } from "./milestone.service";
import "express-async-errors";
import { optionalDateString } from "../../utils/zod";
import { getRepoIdFromPath } from "../../utils/getRepo";
import { ObjectId } from "mongodb";
import { authorize } from "../auth/auth.middleware";
import { isAllowedToAccessRepo } from "../collaborators/collaborators.middleware";

const router = Router();

const milestoneBodySchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().default(""),
  dueDate: optionalDateString,
});

const createMilestoneBodySchema = milestoneBodySchema;
const updateMilestoneBodySchema = milestoneBodySchema;

const localIdSchema = z.number().min(0);

router.get(
  "/repositories/:repositoryId/milestones",
  authorize(),
  isAllowedToAccessRepo(true),
  async (req: Request, res: Response) => {
    const repositoryId = new ObjectId(req.params.repositoryId);

    res.send(await milestoneService.findByRepositoryId(repositoryId));
  }
);

router.get(
  "/:username/:repository/milestones/search",
  authorize(),
  isAllowedToAccessRepo(true),
  async (req: Request, res: Response) => {
    const title = req.query.title;
    const repositoryId = await getRepoIdFromPath(req);
    if (!title) {
      res.send(await milestoneService.findByRepositoryId(repositoryId));
    } else {
      res.send(await milestoneService.searchByTitle(title.toString(), repositoryId));
    }
  }
);

router.get(
  "/:username/:repository/milestones",
  authorize(),
  isAllowedToAccessRepo(true),
  async (req: Request, res: Response) => {
    const isOpen = req.query.state !== "closed";
    const repositoryId = await getRepoIdFromPath(req);
    res.send(await milestoneService.findByRepositoryId(repositoryId, isOpen));
  }
);

router.get(
  "/:username/:repository/milestones/:localId",
  authorize(),
  isAllowedToAccessRepo(true),
  async (req: Request, res: Response) => {
    const localId = localIdSchema.parse(+req.params.localId);
    const repositoryId = await getRepoIdFromPath(req);
    res.send(await milestoneService.findByRepositoryIdAndLocalId(repositoryId, localId));
  }
);

router.post(
  "/:username/:repository/milestones",
  authorize(),
  isAllowedToAccessRepo(),
  async (req: Request, res: Response) => {
    const createMilestone = createMilestoneBodySchema.safeParse(req.body);

    if (!createMilestone.success) {
      res.status(400).send(createMilestone.error.issues);
      return;
    }

    const milestone = createMilestone.data as MilestoneCreate;
    milestone.repositoryId = await getRepoIdFromPath(req);

    res.send(await milestoneService.create(milestone));
  }
);

router.put(
  "/:username/:repository/milestones/:localId",
  authorize(),
  isAllowedToAccessRepo(),
  async (req: Request, res: Response) => {
    const updateMilestone = updateMilestoneBodySchema.safeParse(req.body);

    if (!updateMilestone.success) {
      res.status(400).send(updateMilestone.error.issues);
      return;
    }

    const milestone = updateMilestone.data as MilestoneUpdate;
    milestone.localId = localIdSchema.parse(+req.params.localId);
    milestone.repositoryId = await getRepoIdFromPath(req);

    res.send(await milestoneService.update(milestone));
  }
);

router.delete(
  "/:username/:repository/milestones/:localId",
  authorize(),
  isAllowedToAccessRepo(),
  async (req: Request, res: Response) => {
    const localId = localIdSchema.parse(+req.params.localId);
    const repositoryId = await getRepoIdFromPath(req);
    res.send(await milestoneService.delete(repositoryId, localId));
  }
);

router.put(
  "/:username/:repository/milestones/:localId/close",
  authorize(),
  isAllowedToAccessRepo(),
  async (req: Request, res: Response) => {
    const localId = localIdSchema.parse(+req.params.localId);
    const repositoryId = await getRepoIdFromPath(req);
    res.send(await milestoneService.changeStatus(repositoryId, localId, false));
  }
);

router.put(
  "/:username/:repository/milestones/:localId/open",
  authorize(),
  isAllowedToAccessRepo(),
  async (req: Request, res: Response) => {
    const localId = localIdSchema.parse(+req.params.localId);
    const repositoryId = await getRepoIdFromPath(req);
    res.send(await milestoneService.changeStatus(repositoryId, localId, true));
  }
);

export { milestoneBodySchema, router as milestoneRoutes };
