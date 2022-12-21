import { describe, expect, it, beforeEach, beforeAll } from "@jest/globals";
import { setupGitServer, setupTestEnv } from "../../jest-hooks.utils";
import { type RepositoryService } from "../../../src/features/repository/repository.service";
import { ObjectId } from "mongodb";

describe("RepositoryService", () => {
  setupTestEnv("RepositoryService");

  const { setCreateRepoHandler } = setupGitServer();

  let service: RepositoryService;

  beforeEach(async () => {
    const { repositoryService } = await import(
      "../../../src/features/repository/repository.service"
    );
    const { userRepo } = await import("../../../src/features/user/user.repo");
    service = repositoryService;
    await userRepo.crud.add({
      username: "testuser",
    } as any);
  });

  describe("findOneOrThrow", () => {
    it("should throw MissingEntityException because repository does not exist", async () => {
      const id = new ObjectId();

      const findOneOrThrow = async () => await service.findOneOrThrow(id);
      await expect(findOneOrThrow).rejects.toThrowError("Repository with given id does not exist.");
    });

    it("should return repository", async () => {
      const added = await service.create({ name: "existingRepositoryName", owner: "testuser" } as any);

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      const found = await service.findOneOrThrow(added._id);
      expect(found).not.toBeNull();
      expect(found._id + '').toBe(added._id + '');
    });
  });


  describe("create", () => {
    it("should throw DuplicateException because repository name already exists", async () => {
      const name = "existingName";
      const added = await service.create({ name, owner: "testuser" });

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      await expect(
        service.create({ name, owner: "testuser" })
      ).rejects.toHaveProperty("name", "DuplicateException");
    });

    it("should throw MissingEntityException because user does not exist", async () => {
      await expect(
        service.create({ name: "test", owner: "notexisting" })
      ).rejects.toHaveProperty("name", "MissingEntityException");
    });

    it("should throw BadLogicException if gitserver fails", async () => {
      setCreateRepoHandler(() => {
        return new Promise((_, rej) => rej(new Error()));
      });
      await expect(
        service.create({ name: "test", owner: "testuser" })
      ).rejects.toHaveProperty("name", "BadLogicException");
    });

    it("should create new repository", async () => {
      const createdRepository = await service.create({
        name: "testCreate",
        description: "testDescription",
        owner: "testuser",
      });

      expect(createdRepository).not.toBeNull();
      expect(createdRepository).toHaveProperty("_id");
    });
  });
});
