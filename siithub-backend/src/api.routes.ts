import { Router } from "express";
import { testRoutes } from "./features/test/test.routes";

const router = Router();

router.use("/test", testRoutes);

export { router as apiRoutes };
