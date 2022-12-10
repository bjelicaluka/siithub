import { Request, Response, Router } from "express";
import { testService } from "./test.service";
import { z } from "zod";

const router = Router();

const getTestParamsSchema = z.object({
  id: z.string().min(1, "ID is required."),
});

router.get("/test/:id", async (req: Request, res: Response) => {
  const params = getTestParamsSchema.parse(req.params);

  res.send(await testService.getTest(params.id));
});

export { router as testRoutes };
