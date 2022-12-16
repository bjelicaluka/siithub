import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { authService } from "./auth.service";
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

export {
  router as authRoutes
};