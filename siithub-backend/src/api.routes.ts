import { Router } from "express";
import { labelRoutes } from "./features/label/label.routes";
import { authRoutes } from "./features/auth/auth.routes";
import { testRoutes } from "./features/test/test.routes";
import { userRoutes } from "./features/user/user.routes";
import { issueRoutes } from "./features/issue/issue.router";
import { repositoryRoutes } from "./features/repository/repository.routes";
import { sshKeyRoutes } from "./features/ssh-key/ssh-key.routes";
import { milestoneRoutes } from "./features/milestone/milestone.routes";
import { starRoutes } from "./features/star/star.routes";
import { treeRoutes } from "./features/tree/tree.routes";

const router = Router();

router
  .use("/test", testRoutes)
  .use("/users", userRoutes)
  .use("/auth", authRoutes)
  .use("/repositories", repositoryRoutes)
  .use("/repositories", labelRoutes)
  .use("/repositories", issueRoutes)
  .use("/ssh-keys", sshKeyRoutes)
  .use("/", milestoneRoutes)
  .use("/", starRoutes)
  .use("/", treeRoutes);

export { router as apiRoutes };
