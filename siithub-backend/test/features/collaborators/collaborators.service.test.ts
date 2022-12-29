import { describe, expect, it, beforeEach, beforeAll } from "@jest/globals";
import { setupTestEnv } from "../../jest-hooks.utils";
import { type CollaboratorService } from "../../../src/features/collaborators/collaborators.service";
import { type Repository } from "../../../src/features/repository/repository.model";
import { type User } from "../../../src/features/user/user.model";
import {
  type CollaboratorRemove,
  type CollaboratorAdd,
} from "../../../src/features/collaborators/collaborators.model";
import { ObjectId } from "mongodb";

describe("CollaboratorsService", () => {
  setupTestEnv("CollaboratorsService");

  let service: CollaboratorService;
  let repositoryId: Repository["_id"];
  let userId: User["_id"];

  beforeEach(async () => {
    const { collaboratorsService } = await import(
      "../../../src/features/collaborators/collaborators.service"
    );
    const { repositoryRepo } = await import("../../../src/features/repository/repository.repo");
    const { userRepo } = await import("../../../src/features/user/user.repo");

    service = collaboratorsService;

    repositoryId = (
      (await repositoryRepo.crud.add({
        name: "repoForCollaborators",
      } as any)) as Repository
    )?._id;

    userId = (
      (await userRepo.crud.add({
        username: "userForCollaborating",
      } as any)) as User
    )?._id;
  });

  describe("addCollaborator", () => {
    it("should throw MissingEntityException because repository does not exist", async () => {
      const addCollaborator: CollaboratorAdd = {
        userId,
        repositoryId: new ObjectId(),
      };

      const addCollaboratorAction = async () => service.add(addCollaborator);

      await expect(addCollaboratorAction).rejects.toThrowError(
        "Repository with given id does not exist."
      );
    });

    it("should throw MissingEntityException because user does not exist", async () => {
      const addCollaborator: CollaboratorAdd = {
        userId: new ObjectId(),
        repositoryId,
      };

      const addCollaboratorAction = async () => service.add(addCollaborator);

      await expect(addCollaboratorAction).rejects.toThrowError(
        "User with given id does not exist."
      );
    });

    it("should throw BadLogicException because user is already collaborator on the repository", async () => {
      const addCollaborator: CollaboratorAdd = {
        userId,
        repositoryId,
      };

      await service.add(addCollaborator);

      const addCollaboratorAction = async () => service.add(addCollaborator);

      await expect(addCollaboratorAction).rejects.toThrowError(
        "User is already collaborator on the given repository."
      );
    });

    it("should add user as the collaborator on the repository", async () => {
      const addCollaborator: CollaboratorAdd = {
        userId,
        repositoryId,
      };

      const addedCollaborator = await service.add(addCollaborator);

      expect(addedCollaborator).not.toBeNull();
      expect(addedCollaborator).toHaveProperty("_id");
    });
  });

  describe("removeCollaborator", () => {
    it("should throw BadLogicException because user is not collaborating on the repository", async () => {
      const removeCollaborator: CollaboratorRemove = {
        userId,
        repositoryId,
      };

      const removeCollaboratorAction = async () => service.remove(removeCollaborator);

      await expect(removeCollaboratorAction).rejects.toThrowError(
        "User is not collaborating on the given repository."
      );
    });

    it("should throw MissingEntityException because user does not exist", async () => {
      const addCollaborator: CollaboratorAdd = {
        userId,
        repositoryId,
      };

      await service.add(addCollaborator);

      const removeCollaborator = addCollaborator as CollaboratorRemove;

      const removedCollaborator = await service.remove(removeCollaborator);

      expect(removedCollaborator).not.toBeNull();
      expect(removedCollaborator).toHaveProperty("_id");
    });
  });
});
