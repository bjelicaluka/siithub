import { Router } from "express";
import type { Request, Response } from "express";
import { userService } from "./user.service";
import { z } from "zod";
import { ALPHANUMERIC_REGEX, GITHUB_ACCOUNT, LOWER_CASE_REGEX, NUMERIC_REGEX, SPECIAL_CHARACTERS_REGEX, UPPER_CASE_REGEX } from "../../patterns";
import 'express-async-errors';
import { ObjectId } from "mongodb";
import { userGithubService } from "./user-github.service";
import { asOptionalField } from "../../utils/zod";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const id = req.params['id'];
  
  res.send(await userService.findMany());
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = req.params['id'];
  
  res.send(await userService.findOneOrThrow(new ObjectId(id)));
});

const createUserBodySchema = z.object({
  username: z.string()
    .min(3, "Username should have at least 3 characters.")
    .regex(ALPHANUMERIC_REGEX, "Username should contain only alphanumeric characters."),
  password: z.string()
    .min(8, "Password should have at least 8 characters.")
    .regex(UPPER_CASE_REGEX, "Password should have at least 1 capital letter.")
    .regex(LOWER_CASE_REGEX, "Password should have at least 1 lower letter.")
    .regex(NUMERIC_REGEX, "Password should have at least 1 number.")
    .regex(SPECIAL_CHARACTERS_REGEX, "Password should have at least 1 special character."),
  githubUsername: asOptionalField(z.string().regex(GITHUB_ACCOUNT, "Github username should be valid.")),
  name: z.string().min(1, "Name should be provided."),
  email: z.string().email("Email should be valid."),
  bio: z.string().default("")
});

router.post("/", async (req: Request, res: Response) => {
  const createUser = createUserBodySchema.safeParse(req.body);

  if (!createUser.success) {
    res.send(createUser.error.issues);
    return;
  }

  res.send(await userService.create(createUser.data));
});


const changeGithubAccountBodySchema = z.object({
  username: z.string()
    .regex(GITHUB_ACCOUNT, "Github username should be valid."),
  });

router.put("/:id/github", async (req: Request, res: Response) => {
  const id = new ObjectId(req.params['id']);
  const githubAccount = changeGithubAccountBodySchema.safeParse(req.body);

  if (!githubAccount.success) {
    res.send(githubAccount.error.issues);
    return;
  }

  res.send(await userGithubService.update(id, githubAccount.data));
});

router.delete("/:id/github", async (req: Request, res: Response) => {
  const id = new ObjectId(req.params['id']);

  res.send(await userGithubService.delete(id));
});


export { 
  createUserBodySchema,
  changeGithubAccountBodySchema,
  router as userRoutes
};