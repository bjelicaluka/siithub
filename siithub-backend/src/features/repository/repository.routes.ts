import { type Request, type Response, Router } from "express";
import { z } from "zod";
import { ALPHANUMERIC_REGEX } from "../../patterns";
import { repositoryService } from "./repository.service";
import "express-async-errors";
import { authorizeRepositoryOwner } from "./repository.middleware";
import { starService } from "../star/star.service";
import { getUserIdFromPath } from "../../utils/getUser";
import { authorize } from "../auth/auth.middleware";
import { getUserIdFromRequest } from "../auth/auth.utils";
import { getRepoIdFromPath } from "../../utils/getRepo";

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
    return;
  }
  res.send(await repositoryService.resolveForkedFrom(repo));
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
  res.send(repositoryService.create(repository));
});

router.delete("/:username/:repository", authorizeRepositoryOwner(), async (req: Request, res: Response) => {
  res.send(await repositoryService.delete(req.params.username, req.params.repository));
});

const forkBodySchema = z.object({
  name: z
    .string()
    .min(3, "Name should have at least 3 characters.")
    .regex(ALPHANUMERIC_REGEX, "Name should contain only alphanumeric characters."),
  description: z.string().default(""),
  only1Branch: z.string().optional(),
});

router.post("/fork/:username/:repository", async (req: Request, res: Response) => {
  const fork = forkBodySchema.parse(req.body);
  const userId = getUserIdFromRequest(req);
  res.send(
    await repositoryService.forkRepository(
      { ...fork, repoOwner: req.params.username, repoName: req.params.repository },
      userId
    )
  );
});

router.get("/fork/:username/:repository/:owner", async (req: Request, res: Response) => {
  res.send(await repositoryService.findFork(req.params.owner, await getRepoIdFromPath(req)));
});

router.get("/forks/:username/:repository", authorize(), async (req: Request, res: Response) => {
  res.send(await repositoryService.findForks(await getRepoIdFromPath(req)));
});

router.get("/by-owner/:owner", async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const usersRepos = await repositoryService.findAllByOwner(req.params.owner, userId);
  res.send(await Promise.all(usersRepos.map(async (repo) => await repositoryService.resolveForkedFrom(repo))));
});

export { repositoryBodySchema, router as repositoryRoutes };
