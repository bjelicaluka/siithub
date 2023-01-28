import { describe, expect, it, beforeEach } from "@jest/globals";
import { setupTestEnv } from "../../jest-hooks.utils";
import { type TagsRepo } from "../../../src/features/tags/tags.repo";
import { type Repository } from "../../../src/features/repository/repository.model";
import { ObjectId } from "mongodb";

describe("TagsRepo", () => {
  setupTestEnv("TagsRepo");

  let repository: TagsRepo;
  let repositoryId: Repository["_id"];

  beforeEach(async () => {
    const { tagsRepo } = await import("../../../src/features/tags/tags.repo");
    const { repositoryRepo } = await import("../../../src/features/repository/repository.repo");

    repository = tagsRepo;
    repositoryId = (
      (await repositoryRepo.crud.add({
        name: "repoForTags",
      } as any)) as Repository
    )?._id;
  });

  describe("findByRepositoryId", () => {
    it("shouldn't find by repositoryId", async () => {
      const repositoryId = new ObjectId();

      const found = await repository.findByRepositoryId(repositoryId);

      expect(found.length).toBeFalsy();
    });

    it("should find by repositoryId", async () => {
      const added = await repository.crud.add({ repositoryId } as any);

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      const found = await repository.findByRepositoryId(repositoryId);

      expect(found.length).not.toBeFalsy();
      expect(found[0]).toHaveProperty("repositoryId", repositoryId);
    });
  });

  describe("searchByNameAndRepositoryId", () => {
    it("shouldn't find by name and repositoryId", async () => {
      const name = "NonExistingName";
      const repositoryId = new ObjectId();

      const found = await repository.searchByNameAndRepositoryId(name, repositoryId);

      expect(found?.length).toBeFalsy();
    });

    it("should find by name and repositoryId", async () => {
      const name = "ExistingName";

      const added = await repository.crud.add({ name, repositoryId } as any);

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      const found = await repository.searchByNameAndRepositoryId(name, repositoryId);

      expect(found?.length).not.toBeFalsy();
      expect(found[0]).toHaveProperty("repositoryId", repositoryId);
      expect(found[0]).toHaveProperty("name", name);
    });
  });

  describe("findLatestByRepositoryId", () => {
    it("shouldn't find latest by repositoryId", async () => {
      const isLatest = false;
      const added = await repository.crud.add({ isLatest, repositoryId } as any);

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      const found = await repository.findLatestByRepositoryId(repositoryId);

      expect(found).toBeNull();
    });

    it("should find latest by repositoryId", async () => {
      const isLatest = true;
      const added = await repository.crud.add({ isLatest, repositoryId } as any);

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      const found = await repository.findLatestByRepositoryId(repositoryId);

      expect(found).not.toBeNull();
      expect(found).toHaveProperty("repositoryId", repositoryId);
      expect(found).toHaveProperty("isLatest", isLatest);
    });
  });

  describe("countByRepositoryId", () => {
    it("should return 0", async () => {
      const count = await repository.countByRepositoryId(repositoryId);

      expect(count).toBeFalsy();
    });

    it("should find latest by repositoryId", async () => {
      const added = await repository.crud.add({ repositoryId } as any);

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      const count = await repository.countByRepositoryId(repositoryId);

      expect(count).toBe(1);
    });
  });

  describe("findByVersionAndRepositoryId", () => {
    it("shouldn't find by version and repositoryId", async () => {
      const version = "someVersion";
      const added = await repository.crud.add({ version, repositoryId } as any);

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      const found = await repository.findByVersionAndRepositoryId("nonExistingVersion", repositoryId);

      expect(found).toBeNull();
    });

    it("should find latest by repositoryId", async () => {
      const version = "someVersion";
      const added = await repository.crud.add({ version, repositoryId } as any);

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      const found = await repository.findByVersionAndRepositoryId(version, repositoryId);

      expect(found).not.toBeNull();
      expect(found).toHaveProperty("repositoryId", repositoryId);
      expect(found).toHaveProperty("version", version);
    });
  });
});
