import { describe, expect, it, beforeEach } from "@jest/globals";
import { setupTestEnv } from "../../jest-hooks.utils";
import { type UserService } from "../../../src/features/user/user.service";
import { ObjectId } from "mongodb";

describe("UserService", () => {
  setupTestEnv("UserService");

  let service: UserService;

  beforeEach(async () => {
    const { userService } = await import("../../../src/features/user/user.service");
    service = userService;
  });

  describe("findOneOrThrow", () => {
    it("should throw MissingEntityException because user does not exist", async () => {
      const id = new ObjectId();

      const findOneOrThrow = async () => await service.findOneOrThrow(id);
      await expect(findOneOrThrow).rejects.toThrowError("User with given id does not exist.");
    });

    it("should return user", async () => {
      const added = await service.create({ username: 'existingUsernameId' } as any);

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      const found = await service.findOneOrThrow(added._id);
      expect(found).not.toBeNull();
      expect(found._id + '').toBe(added._id + '');
    });
  });

  describe("create", () => {

    it("should throw DuplicateException because username is taken", async () => {
      const username = "existingUsername";
      const added = await service.create({ username } as any);

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      const createDuplicate = async () => service.create({ username, password: "Test" } as any);
      await expect(createDuplicate).rejects.toThrowError("Username is already taken.");

    });

    it("should throw DuplicateException because github username is taken", async () => {
      const username = "existingGithubUsername";
      const added = await service.create({ username, githubUsername: username } as any);

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      const createDuplicate = async () => service.create({ username: "nonExistingUsername", githubUsername: username, password: "Test" } as any);
      await expect(createDuplicate).rejects.toThrowError("Github username is already taken.");

    });

    it("should create a new user", async () => {
      const createdUser = await service.create({
        username: "test",
        password: "T3stP@assword",
        githubUsername: "test",
        name: "Test",
        email: "test@siithub.com",
        bio: "Some random text"
      });

      expect(createdUser).not.toBeNull();
      expect(createdUser).toHaveProperty("_id");
      expect(createdUser?.passwordAccount).not.toBeNull();
      expect(createdUser?.passwordAccount?.salt).not.toBeNull();
      expect(createdUser?.passwordAccount?.passwordHash).not.toBeNull();
      expect(createdUser?.passwordAccount?.passwordHash).not.toBe("testPassword");
      expect(createdUser?.githubAccount).not.toBeNull;
      expect(createdUser?.githubAccount?.username).toBe("test");
    });
  });
})