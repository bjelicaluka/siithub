import { describe, expect, it, beforeEach } from "@jest/globals";
// Note: when mocking it is important to dynamically import and use type here
import type { BaseEntity, BaseRepo } from "../../src/db/base.repo.utils";
import { setupTestEnv } from "../jest-hooks.utils";

describe("Connection", () => {
  setupTestEnv("connection");

  let repository: BaseRepo<BaseEntity & { name: string }>;

  beforeEach(async () => {
    const { BaseRepoFactory } = await import("../../src/db/base.repo.utils");
    repository = BaseRepoFactory("test");
  });

  describe("findOne", () => {
    it("should find one existing entity", async () => {
      const added = await repository.add({ name: "test" });

      expect(added).not.toBeNull();
      if (!added) return;
      expect(added).toHaveProperty("_id");

      const found = await repository.findOne(added._id);
      expect(found).toHaveProperty("name", "test");
    });
  });

  describe("findMany", () => {
    it("should find many existing entities", async () => {
      await repository.add({ name: "test1" });
      await repository.add({ name: "test2" });
      await repository.add({ name: "test3" });

      const found = await repository.findMany();
      expect(found).toHaveLength(3);
    });

    it("should filter entities", async () => {
      await repository.add({ name: "test1" });
      await repository.add({ name: "test2" });
      await repository.add({ name: "test3" });

      const found = await repository.findMany({ name: "test1" });
      expect(found).toHaveLength(1);
    });
  });

  describe("add", () => {
    it("should add an entity", async () => {
      const added = await repository.add({ name: "test" });

      expect(added).not.toBeNull();
      if (!added) return;
      expect(added).toHaveProperty("_id");

      const found = await repository.findOne(added._id);
      expect(found).toHaveProperty("name", "test");
    });
  });

  describe("update", () => {
    it("should update an existing entity", async () => {
      const added = await repository.add({ name: "test" });

      expect(added).not.toBeNull();
      if (!added) return;
      expect(added).toHaveProperty("_id");

      const foundAdded = await repository.findOne(added._id);
      expect(foundAdded).toHaveProperty("name", "test");

      const updated = await repository.update(added._id, { name: "updated" });
      expect(updated).not.toBeNull();
      if (!updated) return;
      expect(updated).toHaveProperty("_id");

      const foundUpdated = await repository.findOne(updated._id);
      expect(foundUpdated).toHaveProperty("name", "updated");
    });
  });

  describe("delete", () => {
    it("should delete an existing entity", async () => {
      const added = await repository.add({ name: "test" });

      expect(added).not.toBeNull();
      if (!added) return;
      expect(added).toHaveProperty("_id");

      const foundAdded = await repository.findOne(added._id);
      expect(foundAdded).toHaveProperty("name", "test");

      const deleted = await repository.delete(added._id);
      expect(deleted).not.toBeNull();
      if (!deleted) return;
      expect(deleted).toHaveProperty("_id", added._id);
      expect(deleted).toHaveProperty("name", added.name);

      const foundDeleted = await repository.findOne(deleted._id);
      expect(foundDeleted).toBeNull();
    });
  });
});
