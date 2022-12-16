import { Request, Response, Router } from "express";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { ALPHANUMERIC_REGEX, COLOR_REGEX } from "../../patterns";
import { Label } from "./label.model";
import { labelService } from "./label.service";
import 'express-async-errors';
import { labelHasToBelongToRepo } from "./label.middlewares";

const router = Router();

const labelBodySchema = z.object({
  name: z.string()
    .min(3, "Name should have at least 3 characters.")
    .regex(ALPHANUMERIC_REGEX, "Name should contain only alphanumeric characters."),
  description: z.string().default(""),
  color: z.string()
    .min(6, "Color should have 6 hexadecimal numbers.")
    .regex(COLOR_REGEX, "Color should contain only hexadecimal numbers."),
});

const createLabelBodySchema = labelBodySchema;
const updateLabelBodySchema = labelBodySchema;

router.get('/:repositoryId/labels/search', async (req: Request, res: Response) => {
  const name = req.query.name;
  const repositoryId = req.params.repositoryId;
  if (!name) {
    res.send(await labelService.findByRepositoryId(repositoryId));
  } else {
    res.send(await labelService.searchByName(name.toString(), repositoryId));
  }
});

router.get('/:repositoryId/labels/:id', labelHasToBelongToRepo, async (req: Request, res: Response) => {
  const id = new ObjectId(req.params.id);
  res.send(await labelService.findOneOrThrow(id));
});

router.post('/:repositoryId/labels', async (req: Request, res: Response) => {
  const createLabel = createLabelBodySchema.safeParse(req.body);

  if (!createLabel.success) {
    res.send(createLabel.error.issues);
    return;
  } 

  const label = createLabel.data as Label;
  label.repositoryId = (new ObjectId(req.params.repositoryId)).toString();

  res.send(await labelService.create(label));
});

router.put('/:repositoryId/labels/:id', labelHasToBelongToRepo, async (req: Request, res: Response) => {
  const updateLabel = updateLabelBodySchema.safeParse(req.body);

  if (!updateLabel.success) {
    res.send(updateLabel.error.issues);
    return;
  } 

  const label = updateLabel.data as Label;
  label._id = new ObjectId(req.params.id) as any;
  label.repositoryId = req.params.repositoryId as any;

  res.send(await labelService.update(label));
});

router.delete('/:repositoryId/labels/:id', labelHasToBelongToRepo, async (req: Request, res: Response) => {
  const id = new ObjectId(req.params.id) as any;
  res.send(await labelService.delete(id));
});

export {
  labelBodySchema,
  router as labelRoutes
}