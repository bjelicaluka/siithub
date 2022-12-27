import { type Request, type Response, Router } from "express";
import { z } from "zod";
import { ALPHANUMERIC_REGEX } from "../../patterns";
import { repositoryService } from "./repository.service";
import "express-async-errors";

const router = Router();

const repositorySearchSchema = z.object({
  term: z.string().optional(),
  owner: z.string(),
});

router.get("/", async (req: Request, res: Response) => {
  const parsedQuery = repositorySearchSchema.safeParse(req.query);

  if (!parsedQuery.success) {
    res.status(400).send(parsedQuery.error.issues);
    return;
  }

  res.send(
    await repositoryService.search(
      parsedQuery.data.owner,
      parsedQuery.data.term
    )
  );
});

const repositoryBodySchema = z.object({
  name: z
    .string()
    .min(3, "Name should have at least 3 characters.")
    .regex(
      ALPHANUMERIC_REGEX,
      "Name should contain only alphanumeric characters."
    ),
  description: z.string().default(""),
  owner: z.string(),
});

const createRepositoryBodySchema = repositoryBodySchema;

router.post("/", async (req: Request, res: Response) => {
  const createRepository = createRepositoryBodySchema.safeParse(req.body);

  if (!createRepository.success) {
    res.status(400).send(createRepository.error.issues);
    return;
  }

  const repository = createRepository.data;

  res.send(await repositoryService.create(repository));
});

export { repositoryBodySchema, router as repositoryRoutes };
