import { describe, expect, it, beforeEach } from "@jest/globals";
import { setupTestEnv } from "../../jest-hooks.utils";
import { type UserRepo } from "../../../src/features/user/user.repo";

describe("UserRepo", () => {
  setupTestEnv("UserRepo");

  let repository: UserRepo;

  beforeEach(async () => {
    const { userRepo } = await import("../../../src/features/user/user.repo");
    repository = userRepo;
  });

  describe("findByUsername", () => {
    it("shouldn't find by username", async () => {
      const username = "nonExistingUsername";

      const found = await repository.findByUsername(username);
      expect(found).toBeNull();
    });

    it("should find by username", async () => {
      const username = "existingUsername";
      const added = await repository.crud.add({ username } as any);

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      const found = await repository.findByUsername(username);
      expect(found).not.toBeNull();
      expect(found).toHaveProperty("username", username);
    });
  });

  describe("findByGithubUsername", () => {
    it("shouldn't find by github username", async () => {
      const username = "nonExistingGithubUsername";

      const found = await repository.findByGithubUsername(username);
      expect(found).toBeNull();
    });

    it("should find by github username", async () => {
      const username = "existingGithubUsername";
      const added = await repository.crud.add({ username, githubAccount: { username } } as any);

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      const found = await repository.findByGithubUsername(username);
      expect(found).not.toBeNull();
      expect(found?.githubAccount).toHaveProperty("username", username);
    });
  });
})