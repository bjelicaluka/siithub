import { Router } from "express";
import { labelRoutes } from "./features/label/label.routes";
import { authRoutes } from "./features/auth/auth.routes";
import { testRoutes } from "./features/test/test.routes";
import { userRoutes } from "./features/user/user.routes";

const router = Router();

router.use("/test", testRoutes)
      .use("/users", userRoutes)
      .use("/auth", authRoutes)
      .use("/repositories", labelRoutes);

export { router as apiRoutes };
