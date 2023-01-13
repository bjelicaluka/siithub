import { type Request, type Response, Router } from "express";
import { z } from "zod";
import { ALPHANUMERIC_REGEX } from "../../patterns";
import { repositoryService } from "./repository.service";
import "express-async-errors";
import { authorizeRepositoryOwner } from "./repository.middleware";
import { starService } from "../star/star.service";
import { getUserIdFromPath } from "../../utils/getUser";
import { authorize } from "../auth/auth.middleware";
import { Repository } from "./repository.model";
import { labelSeeder } from "../label/label.seeder";
import { userService } from "../user/user.service";
import { collaboratorsService } from "../collaborators/collaborators.service";
import { type User } from "../user/user.model";

const router = Router();

const repositorySearchSchema = z.object({
  term: z.string().optional(),
  owner: z.string(),
});

router.get("/", authorize(), async (req: Request, res: Response) => {
  const query = repositorySearchSchema.parse(req.query);
  res.send(await repositoryService.search(query.owner, query.term));
});

router.get("/starred-by/:username", authorize(), async (req: Request, res: Response) => {
  const userId = await getUserIdFromPath(req);
  const stars = await starService.findByUserId(userId);
  res.send(await repositoryService.findByIds(stars.map((s) => s.repoId)));
});

router.get("/r/:username/:repository", authorize(), async (req: Request, res: Response) => {
  const repo = await repositoryService.findByOwnerAndName(req.params.username, req.params.repository);
  if (!repo) {
    res.status(404).send("Repository not found");
  }
  res.send(repo);
});

const repositoryBodySchema = z.object({
  name: z
    .string()
    .min(3, "Name should have at least 3 characters.")
    .regex(ALPHANUMERIC_REGEX, "Name should contain only alphanumeric characters."),
  type: z.enum(["private", "public"]),
  description: z.string().default(""),
  owner: z.string(),
});

const createRepositoryBodySchema = repositoryBodySchema;

router.post("/", authorizeRepositoryOwner(), async (req: Request, res: Response) => {
  const repository = createRepositoryBodySchema.parse(req.body);

  const createdRepository = await repositoryService.create(repository);
  if (!createdRepository) {
    res.status(400).send("Error while creating repository");
    return;
  }

  await initRepoData(createdRepository);

  res.send(createdRepository);
});

async function initRepoData(repository: Repository) {
  await labelSeeder.seedDefaultLabels(repository?._id);
  const user = (await userService.findByUsername(repository.owner)) as User;

  await collaboratorsService.add({ repositoryId: repository._id, userId: user?._id });
}

router.delete("/:username/:repository", authorizeRepositoryOwner(), async (req: Request, res: Response) => {
  res.send(await repositoryService.delete(req.params.username, req.params.repository));
});

export { repositoryBodySchema, router as repositoryRoutes };
