import { describe, expect, it, beforeEach, beforeAll } from "@jest/globals";
import { setupGitServer, setupTestEnv } from "../../jest-hooks.utils";
import { type TagsRepo } from "../../../src/features/tags/tags.repo";
import { type TagsService } from "../../../src/features/tags/tags.service";
import { type TagCreate, type Tag } from "../../../src/features/tags/tags.model";
import { type Repository } from "../../../src/features/repository/repository.model";
import { type User } from "../../../src/features/user/user.model";
import { ObjectId } from "mongodb";

describe("TagsService", () => {
  setupTestEnv("TagsService");
  const { setGetBranchesHandler, setGetCommitsShaHandler } = setupGitServer();

  let repository: TagsRepo;
  let service: TagsService;
  let repositoryId: Repository["_id"];
  let userId: User["_id"];

  beforeEach(async () => {
    const { tagsRepo } = await import("../../../src/features/tags/tags.repo");
    const { tagsService } = await import("../../../src/features/tags/tags.service");
    const { repositoryRepo } = await import("../../../src/features/repository/repository.repo");
    const { userRepo } = await import("../../../src/features/user/user.repo");

    repository = tagsRepo;
    service = tagsService;
    repositoryId = (
      (await repositoryRepo.crud.add({
        name: "repoForTags",
      } as any)) as Repository
    )?._id;
    userId = (
      (await userRepo.crud.add({
        username: "userForTags",
      } as any)) as User
    )?._id;
  });

  describe("create", () => {
    it("should throw DuplicateEntityException because version already exists", async () => {
      const version = "v1.0.0";
      const repoId = repositoryId;

      (await repository.crud.add({
        version,
        repositoryId: repoId,
      } as any)) as Tag;

      const createTag: TagCreate = {
        version,
        repositoryId: repoId,
      } as any;

      const createDuplicate = async () => service.create(createTag);

      await expect(createDuplicate).rejects.toThrowError("Tag with same version already exists.");
    });

    it("should throw MissingEntityException because repository does not exist", async () => {
      const version = "v1.0.0";
      const repoId = new ObjectId();

      const createTag: TagCreate = {
        version,
        repositoryId: repoId,
      } as any;

      const createDuplicate = async () => service.create(createTag);

      await expect(createDuplicate).rejects.toThrowError("Repository with given id does not exist.");
    });

    it("should throw because branch does not exist", async () => {
      setGetBranchesHandler(() => []);
      const version = "v1.0.0";
      const repoId = repositoryId;
      const branch = "nonExistingBranch";

      const createTag: TagCreate = {
        version,
        repositoryId: repoId,
        branch,
      } as any;

      const createDuplicate = async () => service.create(createTag);

      await expect(createDuplicate).rejects.toThrowError("Branch nonExistingBranch does not exist.");
    });

    it("should throw because user does not exist", async () => {
      setGetBranchesHandler(() => ["master"]);
      const version = "v1.0.0";
      const repoId = repositoryId;
      const branch = "master";
      const author = new ObjectId();

      const createTag: TagCreate = {
        version,
        repositoryId: repoId,
        branch,
        author,
      } as any;

      const createDuplicate = async () => service.create(createTag);

      await expect(createDuplicate).rejects.toThrowError("User with given id does not exist.");
    });

    it("should throw because sha do not exist", async () => {
      setGetBranchesHandler(() => ["master"]);
      setGetCommitsShaHandler(() => "");
      const version = "v1.0.0";
      const repoId = repositoryId;
      const branch = "master";
      const author = userId;

      const createTag: TagCreate = {
        version,
        repositoryId: repoId,
        branch,
        author,
      } as any;

      const createDuplicate = async () => service.create(createTag);

      await expect(createDuplicate).rejects.toThrowError("There is no branch with commits.");
    });

    it("should create tag", async () => {
      setGetBranchesHandler(() => ["master"]);
      setGetCommitsShaHandler(() => "randomSha");
      const version = "v1.0.0";
      const repoId = repositoryId;
      const branch = "master";
      const author = userId;

      const createTag: TagCreate = {
        version,
        repositoryId: repoId,
        branch,
        author,
      } as any;

      const createdTag = await service.create(createTag);

      await expect(createdTag).not.toBeNull();
    });
  });

  describe("delete", () => {
    it("should throw MissingEntityException because version does not exist", async () => {
      const version = "nonExistingVersion";
      const repoId = repositoryId;

      const deleteNonExisting = async () => service.delete(version, repoId);

      await expect(deleteNonExisting).rejects.toThrowError("Tag with given version does not exist in that repository.");
    });

    it("should throw MissingEntityException because repo does not exist", async () => {
      const version = "v1.0.0";
      const repoId = new ObjectId();

      (await repository.crud.add({
        version,
        repositoryId,
      } as any)) as Tag;

      const deleteNonExisting = async () => service.delete(version, repoId);

      await expect(deleteNonExisting).rejects.toThrowError("Tag with given version does not exist in that repository.");
    });

    it("should delete tag", async () => {
      const version = "v1.0.0";
      const repoId = repositoryId;

      const tagToDelete = (await repository.crud.add({
        version,
        repositoryId: repoId,
      } as any)) as Tag;

      const deletedTag = await service.delete(version, repoId);

      expect(deletedTag).toHaveProperty("_id", tagToDelete?._id);
    });
  });
});
