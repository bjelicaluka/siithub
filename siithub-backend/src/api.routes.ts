import { Router } from "express";
import { labelRoutes } from "./features/label/label.routes";
import { authRoutes } from "./features/auth/auth.routes";
import { userRoutes } from "./features/user/user.routes";
import { issueRoutes } from "./features/issue/issue.routes";
import { repositoryRoutes } from "./features/repository/repository.routes";
import { sshKeyRoutes } from "./features/ssh-key/ssh-key.routes";
import { milestoneRoutes } from "./features/milestone/milestone.routes";
import { collaboratorsRoutes } from "./features/collaborators/collaborators.routes";
import { starRoutes } from "./features/star/star.routes";
import { activitiesRoutes } from "./features/activities/activities.routes";
import { blobRoutes } from "./features/blob/blob.routes";
import { treeRoutes } from "./features/tree/tree.routes";
import { branchesRoutes } from "./features/branches/branches.routes";
import { commitRoutes } from "./features/commits/commit.routes";
import { pullRequestRoutes } from "./features/pull-requests/pull-requests.routes";
import { insightRoutes } from "./features/insights/insight.routes";
import { tagsRoutes } from "./features/tags/tags.routes";

const router = Router();

router
  .use("/users", userRoutes)
  .use("/auth", authRoutes)
  .use("/repositories", repositoryRoutes)
  .use("/repositories", labelRoutes)
  .use("/repositories", issueRoutes)
  .use("/repositories", pullRequestRoutes)
  .use("/repositories", collaboratorsRoutes)
  .use("/repositories", tagsRoutes)
  .use("/ssh-keys", sshKeyRoutes)
  .use("/", milestoneRoutes)
  .use("/", starRoutes)
  .use("/", activitiesRoutes)
  .use("/", treeRoutes)
  .use("/", blobRoutes)
  .use("/", commitRoutes)
  .use("/", insightRoutes)
  .use("/", branchesRoutes);

export { router as apiRoutes };
