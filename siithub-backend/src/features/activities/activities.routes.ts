import { type Request, type Response, Router } from "express";
import { getUserIdFromRequest } from "../auth/auth.utils";
import { authorize } from "../auth/auth.middleware";
import { activitiesService } from "./activities.service";
import { z } from "zod";
import { optionalDateString } from "../../utils/zod";

import "express-async-errors";

const router = Router();

const upTillQuerySchema = z.object({
  upTill: optionalDateString.default(null),
});

router.get("/activities", authorize(), async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);

  const { upTill } = upTillQuerySchema.parse(req.query);

  res.send(await activitiesService.findActivities(userId, upTill || undefined));
});

export { router as activitiesRoutes };
