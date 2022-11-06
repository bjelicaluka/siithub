import { Request, Response, Router } from "express";
import { testService } from "./test.service";

const router = Router();

router.get("/test", async (req: Request, res: Response) => {
  res.send(JSON.stringify(await testService.getTestForSomething("asd")));
});

export { router as testRoutes };
