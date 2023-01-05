import { describe, expect, it, beforeEach } from "@jest/globals";
import { setupTestEnv } from "../../jest-hooks.utils";
import { type Repository } from "../../../src/features/repository/repository.model";
import { type DefaultBranchRepoRepo } from "../../../src/features/branches/default-branch.repo";
import { ObjectId } from "mongodb";

describe("DefaultBranchRepo", () => {
  setupTestEnv("DefaultBranchRepo");

  let repository: DefaultBranchRepoRepo;
  let repositoryId: Repository["_id"];
  const username = "testUsername";
  const repoName = "testRepoName";

  beforeEach(async () => {
    const { defaultBranchRepo } = await import("../../../src/features/branches/default-branch.repo");
    const { repositoryRepo } = await import("../../../src/features/repository/repository.repo");

    repository = defaultBranchRepo;

    repositoryId = (
      (await repositoryRepo.crud.add({
        owner: username,
        name: repoName,
      } as any)) as Repository
    )._id;
  });

  describe("findByRepository", () => {
    it("shouldn't find by repositoryId", async () => {
      const repositoryId = new ObjectId();

      const found = await repository.findByRepository(repositoryId);

      expect(found).toBeNull();
    });

    it("shouldn't find by repositoryId", async () => {
      await repository.crud.add({ repositoryId: new ObjectId() } as any);
      const repositoryId = new ObjectId();

      const found = await repository.findByRepository(repositoryId);

      expect(found).toBeNull();
    });

    it("should find by repositoryId", async () => {
      const created = await repository.crud.add({ repositoryId } as any);

      const found = await repository.findByRepository(repositoryId);

      expect(found).not.toBeNull();
      expect(found).toHaveProperty("_id", created?._id);
    });
  });
});
