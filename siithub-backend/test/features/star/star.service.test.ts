import { describe, expect, it, beforeEach } from "@jest/globals";
import { setupTestEnv } from "../../jest-hooks.utils";
import { type StarService } from "../../../src/features/star/star.service";
import { User } from "../../../src/features/user/user.model";
import { Repository } from "../../../src/features/repository/repository.model";
import { RepositoryRepo } from "../../../src/features/repository/repository.repo";

describe("StarService", () => {
  setupTestEnv("StarService");

  let service: StarService;
  let repoRepo: RepositoryRepo;
  let user1: User;
  let user2: User;
  let repo1: Repository;

  beforeEach(async () => {
    const { starService } = await import("../../../src/features/star/star.service");
    const { userRepo } = await import("../../../src/features/user/user.repo");
    const { repositoryRepo } = await import("../../../src/features/repository/repository.repo");
    service = starService;
    repoRepo = repositoryRepo;
    user1 = (await userRepo.crud.add({ username: "user1" } as any)) as User;
    user2 = (await userRepo.crud.add({ username: "user2" } as any)) as User;
    repo1 = (await repositoryRepo.crud.add({ owner: user2.username, name: "name2" } as any)) as Repository;
  });

  describe("addStar", () => {
    it("should add and return star", async () => {
      let count = await service.countByRepoId(repo1._id);
      expect(count).toBe(0);

      const added = await service.addStar(user1._id, repo1._id);

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      const found = await service.findOneOrThrow(added._id);
      expect(found).not.toBeNull();
      expect(found._id + "").toBe(added._id + "");

      count = await service.countByRepoId(repo1._id);
      expect(count).toBe(1);
    });

    it("should not add same star twice", async () => {
      let count = await service.countByRepoId(repo1._id);
      expect(count).toBe(0);

      const added1 = await service.addStar(user1._id, repo1._id);

      expect(added1).not.toBeNull();
      expect(added1).toHaveProperty("_id");
      if (!added1) return;

      const added2 = await service.addStar(user1._id, repo1._id);

      expect(added2).not.toBeNull();
      expect(added2).toHaveProperty("_id");
      if (!added2) return;

      expect(added2._id + "").toBe(added1._id + "");
      count = await service.countByRepoId(repo1._id);
      expect(count).toBe(1);
    });
  });

  describe("removeStar", () => {
    it("should remove star", async () => {
      const added = await service.addStar(user1._id, repo1._id);

      let count = await service.countByRepoId(repo1._id);
      expect(count).toBe(1);

      const removed = await service.removeStar(user1._id, repo1._id);

      expect(removed).not.toBeNull();
      expect(removed).toHaveProperty("_id");
      if (!removed) return;

      expect(removed._id + "").toBe(added?._id + "");
      count = await service.countByRepoId(repo1._id);
      expect(count).toBe(0);
    });
  });

  describe("counting stars", () => {
    it("should save star count in repo", async () => {
      expect(repo1.counters?.stars).toBeUndefined();

      await service.addStar(user1._id, repo1._id);
      repo1 = (await repoRepo.crud.findOne(repo1._id)) as Repository;
      expect(repo1.counters.stars).toBe(1);

      await service.addStar(user2._id, repo1._id);
      repo1 = (await repoRepo.crud.findOne(repo1._id)) as Repository;
      expect(repo1.counters.stars).toBe(2);

      await service.addStar(user2._id, repo1._id);
      repo1 = (await repoRepo.crud.findOne(repo1._id)) as Repository;
      expect(repo1.counters.stars).toBe(2);

      await service.removeStar(user1._id, repo1._id);
      repo1 = (await repoRepo.crud.findOne(repo1._id)) as Repository;
      expect(repo1.counters.stars).toBe(1);

      await service.removeStar(user1._id, repo1._id);
      repo1 = (await repoRepo.crud.findOne(repo1._id)) as Repository;
      expect(repo1.counters.stars).toBe(1);

      await service.removeStar(user2._id, repo1._id);
      repo1 = (await repoRepo.crud.findOne(repo1._id)) as Repository;
      expect(repo1.counters.stars).toBe(0);
    });
  });
});
