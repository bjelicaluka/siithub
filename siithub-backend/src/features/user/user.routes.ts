import { Router } from "express";
import type { Request, Response } from "express";
import { userService } from "./user.service";
import { z } from "zod";
import {
  ALPHANUMERIC_REGEX,
  GITHUB_ACCOUNT,
  LOWER_CASE_REGEX,
  NUMERIC_REGEX,
  SPECIAL_CHARACTERS_REGEX,
  UPPER_CASE_REGEX,
} from "../../patterns";
import "express-async-errors";
import { userGithubService } from "./user-github.service";
import { asOptionalField, objectIdString } from "../../utils/zod";
import { getUserIdFromRequest } from "../auth/auth.utils";

const router = Router();

const idSchema = objectIdString("Invalid id");

const nameQuerySchema = z.object({
  name: z.string().default(""),
});

router.get("/", async (req: Request, res: Response) => {
  const { name } = nameQuerySchema.parse(req.query);

  res.send(await userService.findMany({ name: { $regex: name, $options: "i" } }));
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  res.send(await userService.findOneOrThrow(id));
});

router.get("/by-username/:username", async (req: Request, res: Response) => {
  const username = req.params.username;
  res.send(await userService.findByUsernameOrThrow(username));
});

const passwordSchema = z
  .string()
  .min(8, "Password should have at least 8 characters.")
  .regex(UPPER_CASE_REGEX, "Password should have at least 1 capital letter.")
  .regex(LOWER_CASE_REGEX, "Password should have at least 1 lower letter.")
  .regex(NUMERIC_REGEX, "Password should have at least 1 number.")
  .regex(SPECIAL_CHARACTERS_REGEX, "Password should have at least 1 special character.");

const createUserBodySchema = z.object({
  username: z
    .string()
    .min(3, "Username should have at least 3 characters.")
    .regex(ALPHANUMERIC_REGEX, "Username should contain only alphanumeric characters."),
  password: passwordSchema,
  githubUsername: asOptionalField(
    z.string().regex(GITHUB_ACCOUNT, "Github username should be valid.")
  ),
  name: z.string().min(1, "Name should be provided."),
  email: z.string().email("Email should be valid."),
  bio: z.string().default(""),
});

router.post("/", async (req: Request, res: Response) => {
  const createUser = createUserBodySchema.safeParse(req.body);
  if (!createUser.success) {
    res.send(createUser.error.issues);
    return;
  }
  res.send(await userService.create(createUser.data));
});

const updateProfileBodySchema = z.object({
  name: z.string().min(1, "Name should be provided."),
  email: z.string().email("Email should be valid."),
  bio: z.string().default(""),
});

router.put("/", async (req: Request, res: Response) => {
  const id = getUserIdFromRequest(req);
  const updateUser = updateProfileBodySchema.safeParse(req.body);
  if (!updateUser.success) {
    res.status(400).send(updateUser.error.issues);
    return;
  }
  res.send(await userService.updateProfile(id, updateUser.data));
});

const passwordBodySchema = z.object({
  oldPassword: z.string().min(1, "Old password should be provided."),
  newPassword: passwordSchema,
});

router.put("/change-password", async (req: Request, res: Response) => {
  const id = getUserIdFromRequest(req);
  const passwordUpdate = passwordBodySchema.safeParse(req.body);
  if (!passwordUpdate.success) {
    res.status(400).send(passwordUpdate.error.issues);
    return;
  }
  await userService.updatePassword(id, passwordUpdate.data);
  res.send();
});

const changeGithubAccountBodySchema = z.object({
  username: z.string().regex(GITHUB_ACCOUNT, "Github username should be valid."),
});

router.put("/:id/github", async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  const githubAccount = changeGithubAccountBodySchema.safeParse(req.body);

  if (!githubAccount.success) {
    res.status(400).send(githubAccount.error.issues);
    return;
  }

  res.send(await userGithubService.update(id, githubAccount.data));
});

router.delete("/:id/github", async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);

  res.send(await userGithubService.delete(id));
});

export { createUserBodySchema, changeGithubAccountBodySchema, router as userRoutes };
