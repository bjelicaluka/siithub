import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { authService } from "./auth.service";
import { githubAuthService } from "./auth-github.service";
import 'express-async-errors';

const router = Router();

const credentialsBodySchema = z.object({
  username: z.string(),
  password: z.string()
});

router.post("/", async (req: Request, res: Response) => {
  const credentials = credentialsBodySchema.safeParse(req.body);

  if (!credentials.success) {
    res.send(credentials.error.issues);
    return;
  }

  res.send(await authService.authenticate(credentials.data));
});

router.post("/github", async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const state = req.query.state as string;

  res.send(await githubAuthService.authenticate({ code, state }));
});

export {
  router as authRoutes
};