import { describe, expect, it, beforeEach, beforeAll } from "@jest/globals";
import { setupTestEnv } from "../../jest-hooks.utils";
import { type UserService } from "../../../src/features/user/user.service";

describe("UserService", () => {
  setupTestEnv("UserService");

  let service: UserService;

  beforeEach(async () => {
    const { userService } = await import("../../../src/features/user/user.service");
    service = userService;
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

    it("should create a new user", async () => {
      const createdUser = await service.create({
        username: "test",
        password: "T3stP@assword",
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
    });
  });
})