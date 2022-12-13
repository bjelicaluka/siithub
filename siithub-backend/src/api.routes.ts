import { Router } from "express";
import { testRoutes } from "./features/test/test.routes";
import { userRoutes } from "./features/user/user.routes";

const router = Router();

router.use("/test", testRoutes);
router.use("/user", userRoutes);

export { router as apiRoutes };
