import { type Request, type Response, Router } from "express";
import { z } from "zod";
import { ALPHANUMERIC_REGEX } from "../../patterns";
import { type Repository } from "./repository.model";
import { repositoryService } from "./repository.service";
import "express-async-errors";

const router = Router();

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
    console.log("ASD")
    res.status(400).send(createRepository.error.issues);
    return;
  }

  const repository = createRepository.data;

  res.send(await repositoryService.create(repository));
});

export { repositoryBodySchema, router as repositoryRoutes };
