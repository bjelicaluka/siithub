import { Router } from "express";
import { testRoutes } from "./features/test/test.routes";

const router = Router();

router.use(testRoutes);

export { router as apiRoutes };
