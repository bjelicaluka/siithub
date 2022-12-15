import { Request, Response, Router } from "express";
import { userService } from "./user.service";
import { z } from "zod";
import { ALPHANUMERIC_REGEX, LOWER_CASE_REGEX, NUMERIC_REGEX, SPECIAL_CHARACTERS_REGEX, UPPER_CASE_REGEX } from "../../patterns";
import 'express-async-errors';
import { ObjectId } from "mongodb";

const router = Router();

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


export { 
  createUserBodySchema,
  router as userRoutes
};