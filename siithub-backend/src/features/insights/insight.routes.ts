import "express-async-errors";
import { type Request, type Response, Router } from "express";
import { insightService } from "./insight.service";

const router = Router();

router.get("/insights/:username/:repository/pulse", async (req: Request, res: Response) => {
  res.send(await insightService.getPulseInsights(req.params.username, req.params.repository));
});

router.get("/insights/:username/:repository/commits/:branch/contributors", async (req: Request, res: Response) => {
  res.send(await insightService.getContributorInsights(req.params.username, req.params.repository, req.params.branch));
});

router.get("/insights/:username/:repository/commits/:branch/commits", async (req: Request, res: Response) => {
  res.send(await insightService.getCommitsInsights(req.params.username, req.params.repository, req.params.branch));
});

router.get("/insights/:username/:repository/commits/:branch/frequency", async (req: Request, res: Response) => {
  res.send(
    await insightService.getCodeFrequencyInsights(req.params.username, req.params.repository, req.params.branch)
  );
});

export { router as insightRoutes };
