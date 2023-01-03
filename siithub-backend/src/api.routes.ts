import { Router } from "express";
import { labelRoutes } from "./features/label/label.routes";
import { authRoutes } from "./features/auth/auth.routes";
import { userRoutes } from "./features/user/user.routes";
import { issueRoutes } from "./features/issue/issue.router";
import { repositoryRoutes } from "./features/repository/repository.routes";
import { sshKeyRoutes } from "./features/ssh-key/ssh-key.routes";
import { milestoneRoutes } from "./features/milestone/milestone.routes";
import { collaboratorsRoutes } from "./features/collaborators/collaborators.routes";
import { starRoutes } from "./features/star/star.routes";
import { treeRoutes } from "./features/tree/tree.routes";

const router = Router();

router
  .use("/users", userRoutes)
  .use("/auth", authRoutes)
  .use("/repositories", repositoryRoutes)
  .use("/repositories", labelRoutes)
  .use("/repositories", issueRoutes)
  .use("/repositories", collaboratorsRoutes)
  .use("/ssh-keys", sshKeyRoutes)
  .use("/", milestoneRoutes)
  .use("/", starRoutes)
  .use("/", treeRoutes);

export { router as apiRoutes };
