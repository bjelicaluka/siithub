import "express-async-errors";
import { type Request, type Response, Router } from "express";
import { insightService } from "./insight.service";
import { getRepoIdFromPath } from "../../utils/getRepo";

const router = Router();

router.get("/:username/:repository/insights/pulse", async (req: Request, res: Response) => {
  getRepoIdFromPath(req);
  res.send(await insightService.getPulseInsights(req.params.username, req.params.repository));
});

router.get("/:username/:repository/insights/contributors/:branch", async (req: Request, res: Response) => {
  res.send(await insightService.getContributorInsights(req.params.username, req.params.repository, req.params.branch));
});

router.get("/:username/:repository/insights/commits/:branch", async (req: Request, res: Response) => {
  res.send(await insightService.getCommitsInsights(req.params.username, req.params.repository, req.params.branch));
});

router.get("/:username/:repository/insights/frequency/:branch", async (req: Request, res: Response) => {
  res.send(
    await insightService.getCodeFrequencyInsights(req.params.username, req.params.repository, req.params.branch)
  );
});

export { router as insightRoutes };
