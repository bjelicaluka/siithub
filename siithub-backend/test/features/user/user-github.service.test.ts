import { describe, expect, it, beforeEach } from "@jest/globals";
import { setupTestEnv } from "../../jest-hooks.utils";
import { type UserGithubService } from "../../../src/features/user/user-github.service";

describe("UserGithubService", () => {
  setupTestEnv("UserGithubService");

  let service: UserGithubService;

  beforeEach(async () => {
    const { userGithubService } = await import("../../../src/features/user/user-github.service");
    service = userGithubService;
  });

  describe("updateGithubAccount", () => {
    it("should throw MissingEntityException because user does not exist", async () => {
      const id = "nonExistingId";

      const update = async () => await service.update(id, { username: "nonExistingUsername" });
      await expect(update).rejects.toThrowError("User with given id does not exist.");
    });

    it("should throw DuplicateException because username is duplicate", async () => {
      const { userService } = await import("../../../src/features/user/user.service");

      const duplicate = await userService.create({ username: 'duplicateGithubUsername', githubAccount: { username: 'duplicateGithubUsername' } } as any);
      expect(duplicate).not.toBeNull();
      expect(duplicate).toHaveProperty("_id");
      if (!duplicate) return;

      const toUpdate = await userService.create({ username: 'toUpdateGithubUsername', githubAccount: { username: 'toUpdateGithubUsername' } } as any);
      expect(toUpdate).not.toBeNull();
      expect(toUpdate).toHaveProperty("_id");
      if (!toUpdate) return;

      const update = async () => await service.update(toUpdate._id, { username: "duplicateGithubUsername" });
      await expect(update).rejects.toThrowError("Github username is already taken.");
    });

    it("should update github account", async () => {
      const { userService } = await import("../../../src/features/user/user.service");

      const toUpdate = await userService.create({ username: 'uniqueGithubUsername', githubAccount: { username: 'uniqueGithubUsername' } } as any);
      expect(toUpdate).not.toBeNull();
      expect(toUpdate).toHaveProperty("_id");
      if (!toUpdate) return;

      const updatedUser = await service.update(toUpdate._id, { username: "updatedUniqueGithubUsername" });
      expect(updatedUser).not.toBeNull();
      expect(updatedUser?.githubAccount).toHaveProperty("username", "updatedUniqueGithubUsername");
    });
  });

  describe("deleteGithubAccount", () => {
    it("should throw MissingEntityException because user does not exist", async () => {
      const id = "nonExistingId";

      const _delete = async () => await service.delete(id);
      await expect(_delete).rejects.toThrowError("User with given id does not exist.");
    });

    it("should throw BadLogicException because username is not set", async () => {
      const { userService } = await import("../../../src/features/user/user.service");

      const toDelete = await userService.create({ username: 'userWithoutGihubAccount' } as any);
      expect(toDelete).not.toBeNull();
      expect(toDelete).toHaveProperty("_id");
      if (!toDelete) return;

      const _delete = async () => await service.delete(toDelete._id);
      await expect(_delete).rejects.toThrowError("Github username is not set.");
    });

    it("should delete github account", async () => {
      const { userService } = await import("../../../src/features/user/user.service");

      const toDelete = await userService.create({ username: 'uniqueGithubUsername', githubAccount: { username: 'uniqueGithubUsername' } } as any);
      expect(toDelete).not.toBeNull();
      expect(toDelete).toHaveProperty("_id");
      if (!toDelete) return;

      const deletedUser = await service.delete(toDelete._id);
      expect(deletedUser).not.toBeNull();
      expect(deletedUser?.githubAccount).toBeNull();
    });
  });

});