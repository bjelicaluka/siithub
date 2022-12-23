import { type Request, type Response, Router } from "express";
import { z } from "zod";
import { sshKeyService } from "./ssh-key.service";
import "express-async-errors";

const router = Router();

const sshKeyBodySchema = z.object({
  name: z
    .string()
    .min(3, "Name should have at least 3 characters."),
  value: z.string(),
  owner: z.string(),
});

const createSshKeyBodySchema = sshKeyBodySchema;

router.post("/", async (req: Request, res: Response) => {
  const createSshKey = createSshKeyBodySchema.safeParse(req.body);

  if (!createSshKey.success) {
    res.status(400).send(createSshKey.error.issues);
    return;
  }

  const sshKey = createSshKey.data;

  res.send(await sshKeyService.create(sshKey));
});

const sshKeyParamsSchema = z.object({
  id: z.string().uuid(),
});

router.put("/:id", async (req: Request, res: Response) => {
  const params = sshKeyParamsSchema.safeParse(req.params);
  const updateSshKey = createSshKeyBodySchema.safeParse(req.body);

  if (!updateSshKey.success) {
    res.status(400).send(updateSshKey.error.issues);
    return;
  }
  if (!params.success) {
    res.status(400).send(params.error.issues);
    return;
  }

  const sshKey = updateSshKey.data;

  res.send(await sshKeyService.update(params.data.id, sshKey));
});

router.delete("/:id", async (req: Request, res: Response) => {
  const params = sshKeyParamsSchema.safeParse(req.params);

  if (!params.success) {
    res.status(400).send(params.error.issues);
    return;
  }

  res.send(await sshKeyService.delete(params.data.id));
});

export { sshKeyBodySchema, router as sshKeyRoutes };
