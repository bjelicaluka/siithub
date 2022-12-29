import { describe, expect, it, beforeEach } from "@jest/globals";
import { setupGitServer, setupTestEnv } from "../../jest-hooks.utils";
import { type RepositoryService } from "../../../src/features/repository/repository.service";
import { ObjectId } from "mongodb";
import { RepositoryCreate } from "../../../src/features/repository/repository.model";

describe("RepositoryService", () => {
  setupTestEnv("RepositoryService");

  const { setCreateRepoHandler, setDeleteRepoHandler } = setupGitServer();

  let service: RepositoryService;
  let owner = "testuser";

  beforeEach(async () => {
    const { repositoryService } = await import("../../../src/features/repository/repository.service");
    const { userRepo } = await import("../../../src/features/user/user.repo");
    service = repositoryService;
    await userRepo.crud.add({ username: owner } as any);
    await userRepo.crud.add({ username: "other-user" } as any);
  });

  describe("findOneOrThrow", () => {
    it("should throw MissingEntityException because repository does not exist", async () => {
      const id = new ObjectId();

      const findOneOrThrow = async () => await service.findOneOrThrow(id);
      await expect(findOneOrThrow).rejects.toThrowError("Repository with given id does not exist.");
    });

    it("should return repository", async () => {
      const added = await service.create({
        name: "existingRepositoryName",
        owner,
        type: "private",
      });

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      const found = await service.findOneOrThrow(added._id);
      expect(found).not.toBeNull();
      expect(found._id + "").toBe(added._id + "");
    });
  });

  describe("findByOwnerAndName", () => {
    it("should return null because repository does not exist", async () => {
      const found = await service.findByOwnerAndName(owner, "not-repo");
      expect(found).toBeNull();
    });

    it("should return repository", async () => {
      const name = "existingName";
      const added = await service.create({ name, owner, type: "private" });

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      const found = await service.findByOwnerAndName(owner, name);
      expect(found).not.toBeNull();
      if (!found) return;
      expect(found._id + "").toBe(added._id + "");
    });
  });

  describe("getNextCounterValue", () => {
    it("should get next counter value", async () => {
      const added = await service.create({
        name: "existingRepositoryName",
        owner,
        type: "private",
      });

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      let val = await service.getNextCounterValue(added._id, "milestone");
      expect(val).toBe(1);
      val = await service.getNextCounterValue(added._id, "milestone");
      expect(val).toBe(2);
    });
  });

  describe("create", () => {
    it("should throw DuplicateException because repository name already exists", async () => {
      const name = "existingName";
      const added = await service.create({ name, owner, type: "private" });

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      await expect(service.create({ name, owner, type: "private" })).rejects.toHaveProperty(
        "name",
        "DuplicateException"
      );
    });

    it("should throw MissingEntityException because user does not exist", async () => {
      await expect(service.create({ name: "test", owner: "notexisting", type: "private" })).rejects.toHaveProperty(
        "name",
        "MissingEntityException"
      );
    });

    it("should throw BadLogicException if gitserver fails", async () => {
      setCreateRepoHandler(() => {
        return new Promise((_, rej) => rej(new Error()));
      });
      await expect(service.create({ name: "test", owner, type: "private" })).rejects.toHaveProperty(
        "name",
        "BadLogicException"
      );
    });

    it("should create new repository", async () => {
      const createdRepository = await service.create({
        name: "testCreate",
        description: "testDescription",
        owner,
        type: "private",
      });

      expect(createdRepository).not.toBeNull();
      expect(createdRepository).toHaveProperty("_id");
    });

    it("should create repositories with same name if users are different", async () => {
      const name = "popular-name";
      const createdRepository1 = await service.create({
        name,
        owner,
        type: "private",
      });
      expect(createdRepository1).not.toBeNull();
      expect(createdRepository1).toHaveProperty("_id");

      const createdRepository2 = await service.create({
        name,
        owner: "other-user",
        type: "private",
      });
      expect(createdRepository2).not.toBeNull();
      expect(createdRepository2).toHaveProperty("_id");
    });
  });

  describe("search", () => {
    it("should return all repos of a user if term empty", async () => {
      await service.create({ name: "test", owner, type: "private" });
      await service.create({ name: "another", owner, type: "private" });
      await service.create({ name: "term", owner, type: "private" });

      const result = await service.search(owner, "");

      expect(result).toHaveLength(3);
    });

    it("should return all repos of a user if term is not provided", async () => {
      await service.create({ name: "test", owner, type: "private" });
      await service.create({ name: "another", owner, type: "private" });
      await service.create({ name: "term", owner, type: "private" });

      const result = await service.search(owner);

      expect(result).toHaveLength(3);
    });

    it("should return repositories of a user whose name includes term", async () => {
      await service.create({ name: "test", owner, type: "private" });
      await service.create({ name: "another", owner, type: "private" });
      await service.create({ name: "term", owner, type: "private" });

      const result = await service.search(owner, "te");

      expect(result).toHaveLength(2);

      expect(result.find((x) => x.name === "test")).toBeTruthy();
      expect(result.find((x) => x.name === "term")).toBeTruthy();
    });

    it("should return no repositories of a user that don't include the term", async () => {
      await service.create({ name: "test", owner, type: "private" });
      await service.create({ name: "another", owner, type: "private" });
      await service.create({ name: "term", owner, type: "private" });

      const result = await service.search(owner, "tem");

      expect(result).toHaveLength(0);
    });
  });

  describe("delete", () => {
    it("should throw MissingEntityException because repo does not exist", async () => {
      await expect(service.delete(owner, "not-repo")).rejects.toHaveProperty("name", "MissingEntityException");
    });

    it("should throw BadLogicException if gitserver fails", async () => {
      setDeleteRepoHandler(() => {
        return new Promise((_, rej) => rej(new Error()));
      });
      const createdRepository = await service.create({
        name: "testCreate",
        description: "testDescription",
        owner,
      } as RepositoryCreate);
      expect(createdRepository).not.toBeNull();
      if (!createdRepository) return;

      await expect(service.delete(createdRepository.owner, createdRepository.name)).rejects.toHaveProperty(
        "name",
        "BadLogicException"
      );
    });

    it("should delete existing repository", async () => {
      const createdRepository = await service.create({
        name: "testCreate",
        description: "testDescription",
        owner,
      } as RepositoryCreate);
      expect(createdRepository).not.toBeNull();
      if (!createdRepository) return;

      const deletedRepository = await service.delete(createdRepository.owner, createdRepository.name);

      expect(deletedRepository).not.toBeNull();
      expect(deletedRepository).toHaveProperty("_id", createdRepository._id);
    });
  });
});
