import { describe, expect, it, beforeEach } from "@jest/globals";
import { setupTestEnv } from "../../jest-hooks.utils";
import { type Repository } from "../../../src/features/repository/repository.model";
import { type CollaboratorsRepo } from "../../../src/features/collaborators/collaborators.repo";
import { type User } from "../../../src/features/user/user.model";
import { ObjectId } from "mongodb";

describe("CollaboratorsRepo", () => {
  setupTestEnv("CollaboratorsRepo");

  let repository: CollaboratorsRepo;
  let repositoryId: Repository["_id"];
  let userId: User["_id"];

  beforeEach(async () => {
    const { collaboratorsRepo } = await import("../../../src/features/collaborators/collaborators.repo");

    repository = collaboratorsRepo;
    repositoryId = new ObjectId();
    userId = new ObjectId();
  });

  describe("findByRepository", () => {
    it("shouldn't find by repositoryId", async () => {
      const repositoryId = new ObjectId();

      const found = await repository.findByRepository(repositoryId);
      expect(found.length).toBeFalsy();
    });

    it("shouldn't find by repositoryId", async () => {
      await repository.crud.add({ repositoryId: new ObjectId() } as any);

      const repositoryId = new ObjectId();

      const found = await repository.findByRepository(repositoryId);
      expect(found.length).toBeFalsy();
    });

    it("should find by repositoryId", async () => {
      await repository.crud.add({ repositoryId: repositoryId } as any);
      await repository.crud.add({ repositoryId: new ObjectId() } as any);
      await repository.crud.add({ repositoryId: repositoryId } as any);

      const found = await repository.findByRepository(repositoryId);

      expect(found.length).not.toBeFalsy();
      expect(found[0]).toHaveProperty("repositoryId", repositoryId);
      expect(found[1]).toHaveProperty("repositoryId", repositoryId);
    });
  });

  describe("findByUser", () => {
    it("shouldn't find by userId", async () => {
      const userId = new ObjectId();

      const found = await repository.findByUser(userId);
      expect(found.length).toBeFalsy();
    });

    it("shouldn't find by userId", async () => {
      await repository.crud.add({ userId: new ObjectId() } as any);

      const userId = new ObjectId();

      const found = await repository.findByUser(userId);
      expect(found.length).toBeFalsy();
    });

    it("should find by userId", async () => {
      await repository.crud.add({ userId: new ObjectId() } as any);
      await repository.crud.add({ userId } as any);

      const found = await repository.findByUser(userId);

      expect(found.length).not.toBeFalsy();
      expect(found[0]).toHaveProperty("userId", userId);
    });
  });

  describe("findByRepositoryAndUser", () => {
    it("shouldn't find by repositoryId", async () => {
      await repository.crud.add({ repositoryId: new ObjectId(), userId } as any);

      const found = await repository.findByRepositoryAndUser(repositoryId, userId);

      expect(found).toBeNull();
    });

    it("shouldn't find by repositoryId", async () => {
      await repository.crud.add({ repositoryId, userId: new ObjectId() } as any);

      const found = await repository.findByRepositoryAndUser(repositoryId, userId);

      expect(found).toBeNull();
    });

    it("should find by repositoryAndUser", async () => {
      await repository.crud.add({ repositoryId, userId: new ObjectId() } as any);
      await repository.crud.add({ repositoryId, userId } as any);

      const found = await repository.findByRepositoryAndUser(repositoryId, userId);

      expect(found).not.toBeNull();
      expect(found).toHaveProperty("repositoryId", repositoryId);
      expect(found).toHaveProperty("userId", userId);
    });
  });
});
