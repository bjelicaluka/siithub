import { Router } from "express";
import { labelRoutes } from "./features/label/label.routes";
import { testRoutes } from "./features/test/test.routes";
import { userRoutes } from "./features/user/user.routes";

const router = Router();

router.use("/test", testRoutes);
router.use("/users", userRoutes);
router.use("/repositories", labelRoutes);

export { router as apiRoutes };
