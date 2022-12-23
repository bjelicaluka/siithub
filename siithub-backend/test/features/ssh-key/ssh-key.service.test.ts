import { describe, expect, it, beforeEach } from "@jest/globals";
import { setupGitServer, setupTestEnv } from "../../jest-hooks.utils";
import { type SshKeyService } from "../../../src/features/ssh-key/ssh-key.service";
import { ObjectId } from "mongodb";

describe("SshKeyService", () => {
  setupTestEnv("SshKeyService");

  const {
    setAddSshKeyHandler,
    setUpdateSshKeyHandler,
    setRemoveSshKeyHandler,
  } = setupGitServer();

  let service: SshKeyService;

  beforeEach(async () => {
    const { sshKeyService } = await import(
      "../../../src/features/ssh-key/ssh-key.service"
    );
    const { userRepo } = await import("../../../src/features/user/user.repo");
    service = sshKeyService;
    await userRepo.crud.add({
      username: "testuser",
    } as any);
  });

  describe("findOneOrThrow", () => {
    it("should throw MissingEntityException because sshKey does not exist", async () => {
      const id = new ObjectId();

      const findOneOrThrow = async () => await service.findOneOrThrow(id);
      await expect(findOneOrThrow).rejects.toThrowError(
        "SshKey with given id does not exist."
      );
    });

    it("should return sshKey", async () => {
      const added = await service.create({
        name: "existingSshKeyName",
        owner: "testuser",
      } as any);

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      const found = await service.findOneOrThrow(added._id);
      expect(found).not.toBeNull();
      expect(found._id + "").toBe(added._id + "");
    });
  });

  describe("create", () => {
    it("should throw DuplicateException because sshKey name already exists", async () => {
      const name = "existingName";
      const added = await service.create({
        name,
        value: "key-for-testing",
        owner: "testuser",
      });

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      await expect(
        service.create({ name, value: "key-for-testing", owner: "testuser" })
      ).rejects.toHaveProperty("name", "DuplicateException");
    });

    it("should throw MissingEntityException because user does not exist", async () => {
      await expect(
        service.create({
          name: "test",
          value: "key-for-testing",
          owner: "notexisting",
        })
      ).rejects.toHaveProperty("name", "MissingEntityException");
    });

    it("should throw BadLogicException if gitserver fails", async () => {
      setAddSshKeyHandler(() => {
        return new Promise((_, rej) => rej(new Error()));
      });
      await expect(
        service.create({
          name: "test",
          value: "key-for-testing",
          owner: "testuser",
        })
      ).rejects.toHaveProperty("name", "BadLogicException");
    });

    it("should create new sshKey", async () => {
      const createdSshKey = await service.create({
        name: "testCreate",
        value: "key-for-testing",
        owner: "testuser",
      });

      expect(createdSshKey).not.toBeNull();
      expect(createdSshKey).toHaveProperty("_id");
    });
  });

  describe("update", () => {
    it("should throw MissingEntityException because key does not exist", async () => {
      await expect(
        service.update("notexisting", {
          name: "test",
          value: "key-for-testing",
          owner: "notexisting",
        })
      ).rejects.toHaveProperty("name", "MissingEntityException");
    });

    it("should throw DuplicateException because sshKey name already exists", async () => {
      const name = "existingName";
      const added = await service.create({
        name,
        value: "key-for-testing",
        owner: "testuser",
      });

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      await expect(
        service.update(added._id as any, {
          name,
          value: "key-for-testing",
          owner: "testuser",
        })
      ).rejects.toHaveProperty("name", "DuplicateException");
    });

    it("should throw MissingEntityException because user does not exist", async () => {
      const name = "notexisting";
      const added = await service.create({
        name,
        value: "key-for-testing",
        owner: "testuser",
      });

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      await expect(
        service.update(added._id as any, {
          name: "test",
          value: "key-for-testing",
          owner: "notexisting",
        })
      ).rejects.toHaveProperty("name", "MissingEntityException");
    });

    it("should throw BadLogicException if gitserver fails", async () => {
      setUpdateSshKeyHandler(() => {
        return new Promise((_, rej) => rej(new Error()));
      });
      const createdSshKey = await service.create({
        name: "testCreate",
        value: "key-for-testing",
        owner: "testuser",
      });

      expect(createdSshKey).not.toBeNull();
      expect(createdSshKey).toHaveProperty("_id");
      await expect(
        service.update(createdSshKey?._id as any, {
          name: "test",
          value: "key-for-testing",
          owner: "testuser",
        })
      ).rejects.toHaveProperty("name", "BadLogicException");
    });

    it("should update sshKey", async () => {
      const createdSshKey = await service.create({
        name: "testCreate",
        value: "key-for-testing",
        owner: "testuser",
      });

      expect(createdSshKey).not.toBeNull();
      expect(createdSshKey).toHaveProperty("_id");

      const updatedSshKey = await service.update(createdSshKey?._id as any, {
        name: "testUpdate",
        value: "key-for-testing-updated",
        owner: "testuser",
      });

      expect(updatedSshKey).toHaveProperty("name", "testUpdate");
      expect(updatedSshKey).toHaveProperty("value", "key-for-testing-updated");
    });
  });

  describe("delete", () => {
    it("should throw MissingEntityException because key does not exist", async () => {
      await expect(service.delete("notexisting")).rejects.toHaveProperty(
        "name",
        "MissingEntityException"
      );
    });

    it("should throw BadLogicException if gitserver fails", async () => {
      setRemoveSshKeyHandler(() => {
        return new Promise((_, rej) => rej(new Error()));
      });
      const createdSshKey = await service.create({
        name: "testCreate",
        value: "key-for-testing",
        owner: "testuser",
      });

      expect(createdSshKey).not.toBeNull();
      expect(createdSshKey).toHaveProperty("_id");
      await expect(
        service.delete(createdSshKey?._id as any)
      ).rejects.toHaveProperty("name", "BadLogicException");
    });

    it("should delete sshKey", async () => {
      const createdSshKey = await service.create({
        name: "testCreate",
        value: "key-for-testing",
        owner: "testuser",
      });

      expect(createdSshKey).not.toBeNull();
      expect(createdSshKey).toHaveProperty("_id");

      const deletedSshKey = await service.delete(createdSshKey?._id as any);

      expect(deletedSshKey).toHaveProperty("name", "testCreate");
      expect(deletedSshKey).toHaveProperty("value", "key-for-testing");
    });
  });
});
