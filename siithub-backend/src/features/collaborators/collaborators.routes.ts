import { type Request, type Response, Router } from "express";
import { collaboratorsService } from "./collaborators.service";
import { getRepoIdFromPath } from "../../utils/getRepo";
import { type CollaboratorRemove, type CollaboratorAdd, type Collaborator } from "./collaborators.model";
import { z } from "zod";
import { objectIdString } from "../../utils/zod";
import "express-async-errors";
import { userService } from "../user/user.service";
import { type User } from "../user/user.model";
import { authorize } from "../auth/auth.middleware";
import { isAllowedToAccessRepo } from "./collaborators.middleware";
import { authorizeRepositoryOwner } from "../repository/repository.middleware";

const router = Router();

const addCollaboratorSchema = z.object({
  userId: objectIdString("User id must be provided."),
});
const removeCollaboratorSchema = addCollaboratorSchema;

const nameQuerySchema = z.object({
  name: z.string().default(""),
});

router.get(
  "/:username/:repository/collaborators",
  authorize(),
  isAllowedToAccessRepo(),
  async (req: Request, res: Response) => {
    const repositoryId = await getRepoIdFromPath(req);
    const { name } = nameQuerySchema.parse(req.query);

    const collaborators = await collaboratorsService.findByRepository(repositoryId);

    res.send(await mapGetResponse(collaborators, name));
  }
);

async function mapGetResponse(collaborators: Collaborator[], name: string): Promise<any[]> {
  const collaboratorUserIds = collaborators?.map((c) => c.userId);
  const users = await userService.findManyByIds(collaboratorUserIds, {
    name: { $regex: name, $options: "i" },
  });
  const usersMap = users.reduce((acc: any, user: User) => {
    acc[user._id.toString()] = user;
    return acc;
  }, {});

  return collaborators
    .map((c: Collaborator) => ({
      ...c,
      user: usersMap[c.userId.toString()],
    }))
    .filter((c) => !!c.user);
}

router.post(
  "/:username/:repository/collaborators",
  authorize(),
  authorizeRepositoryOwner(),
  async (req: Request, res: Response) => {
    const addCollaboratorParsed = addCollaboratorSchema.parse(req.body);

    const repositoryId = await getRepoIdFromPath(req);
    const addCollaborator: CollaboratorAdd = {
      ...addCollaboratorParsed,
      repositoryId,
    };

    res.send(await collaboratorsService.add(addCollaborator));
  }
);

router.delete(
  "/:username/:repository/collaborators",
  authorize(),
  authorizeRepositoryOwner(),
  async (req: Request, res: Response) => {
    const removeCollaboratorParsed = removeCollaboratorSchema.parse(req.body);

    const repositoryId = await getRepoIdFromPath(req);
    const removeCollaborator: CollaboratorRemove = {
      ...removeCollaboratorParsed,
      repositoryId,
    };

    res.send(await collaboratorsService.remove(removeCollaborator));
  }
);

export { addCollaboratorSchema, removeCollaboratorSchema };

export { router as collaboratorsRoutes };
