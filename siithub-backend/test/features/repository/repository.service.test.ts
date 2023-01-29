import { describe, expect, it, beforeEach } from "@jest/globals";
import { setupGitServer, setupTestEnv } from "../../jest-hooks.utils";
import { type RepositoryService } from "../../../src/features/repository/repository.service";
import { ObjectId } from "mongodb";
import { type RepositoryCreate } from "../../../src/features/repository/repository.model";
import { type User, type UserCreate } from "../../../src/features/user/user.model";

describe("RepositoryService", () => {
  setupTestEnv("RepositoryService");

  const { setCreateRepoHandler, setDeleteRepoHandler, setCreateRepoForkHandler } = setupGitServer();

  let service: RepositoryService;
  let owner = "testuser";
  let otherUser: User;

  beforeEach(async () => {
    const { repositoryService } = await import("../../../src/features/repository/repository.service");
    const { userRepo } = await import("../../../src/features/user/user.repo");
    service = repositoryService;
    await userRepo.crud.add({ username: owner } as UserCreate);
    otherUser = (await userRepo.crud.add({ username: "other-user" } as UserCreate)) as User;
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

  describe("increaseCounterValue", () => {
    it("should get next counter value", async () => {
      const added = await service.create({
        name: "existingRepositoryName",
        owner,
        type: "private",
      });

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      let val = await service.increaseCounterValue(added._id, "milestone");
      expect(val).toBe(1);
      val = await service.increaseCounterValue(added._id, "milestone");
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
        type: "public",
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
        type: "public",
      } as RepositoryCreate);
      expect(createdRepository).not.toBeNull();
      if (!createdRepository) return;

      const deletedRepository = await service.delete(createdRepository.owner, createdRepository.name);

      expect(deletedRepository).not.toBeNull();
      expect(deletedRepository).toHaveProperty("_id", createdRepository._id);
    });
  });

  describe("forkRepository", () => {
    it("should throw MissingEntityException because repo does not exist", async () => {
      await expect(
        service.forkRepository({ name: "fork1", repoName: "no-repo", repoOwner: owner }, otherUser._id)
      ).rejects.toThrowError("Repository does not exist.");
    });

    it("should throw MissingEntityException because user does not exist", async () => {
      await service.create({ name: "test", owner, type: "public" });
      await expect(
        service.forkRepository({ name: "fork1", repoName: "test", repoOwner: owner }, new ObjectId())
      ).rejects.toThrowError("User with given id does not exist.");
    });

    it("should throw BadLogicException because cannot fork own repository", async () => {
      await service.create({ name: "test", owner: otherUser.username, type: "public" });
      await expect(
        service.forkRepository({ name: "fork1", repoName: "test", repoOwner: otherUser.username }, otherUser._id)
      ).rejects.toThrowError("You cannot fork your own repository.");
    });

    it("should throw ForbiddenException because repo is private and user is not collaborator", async () => {
      await service.create({ name: "test", owner, type: "private" });
      await expect(
        service.forkRepository({ name: "fork1", repoName: "test", repoOwner: owner }, otherUser._id)
      ).rejects.toHaveProperty("name", "ForbiddenException");
    });

    it("should throw BadLogicException because fork already exists", async () => {
      const repo = await service.create({ name: "test", owner, type: "public" });
      await service.create({ name: "fork", owner: otherUser.username, type: "public", forkedFrom: repo._id });
      await expect(
        service.forkRepository({ name: "fork1", repoName: "test", repoOwner: owner }, otherUser._id)
      ).rejects.toThrowError("You already have forked this repository.");
    });

    it("should throw DuplicateException because repo with same name exists", async () => {
      await service.create({ name: "test", owner, type: "public" });
      await service.create({ name: "repo", owner: otherUser.username, type: "public" });
      await expect(
        service.forkRepository({ name: "repo", repoName: "test", repoOwner: owner }, otherUser._id)
      ).rejects.toHaveProperty("name", "DuplicateException");
    });

    it("should throw BadLogicException if gitserver fails", async () => {
      setCreateRepoForkHandler(() => {
        return new Promise((_, rej) => rej(new Error()));
      });
      await service.create({ name: "test", owner, type: "public" });
      await expect(
        service.forkRepository({ name: "fork1", repoName: "test", repoOwner: owner }, otherUser._id)
      ).rejects.toThrowError("Failed to create repository in the file system.");
    });

    it("should create a new fork", async () => {
      let repo = await service.create({ name: "test", owner, type: "public" });
      const createdRepository = await service.forkRepository(
        { name: "fork1", repoName: "test", repoOwner: owner },
        otherUser._id
      );
      expect(createdRepository).not.toBeNull();
      expect(createdRepository).toHaveProperty("_id");
      repo = await service.findOneOrThrow(repo._id);
      expect(repo.counters["forks"]).toBe(1);
    });
  });
});
