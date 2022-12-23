import { describe, expect, it, beforeEach } from "@jest/globals";
import { setupTestEnv } from "../../jest-hooks.utils";
import { type MilestoneService } from "../../../src/features/milestone/milestone.service";
import type { MilestoneCreate, MilestoneUpdate, Milestone } from "../../../src/features/milestone/milestone.model";
import type { RepositoryCreate, Repository } from "../../../src/features/repository/repository.model";
import { ObjectId } from "mongodb";

describe("MilestoneService", () => {
  setupTestEnv("MilestoneService");

  let service: MilestoneService;
	let repositoryId: Repository["_id"];

  let dueDate = new Date();

  beforeEach(async () => {
    const { milestoneService } = await import("../../../src/features/milestone/milestone.service");
    const { repositoryRepo } = await import("../../../src/features/repository/repository.repo")

    service = milestoneService;
		repositoryId = (await repositoryRepo.crud.add({
			name: 'repoForMilestones'
		} as RepositoryCreate) as Repository)?._id;

  });

  describe("findOneOrThrow", () => {

    it("should throw MissingEntityException because milestone does not exist", async () => {
      const id = new ObjectId();

      const findOneOrThrow = async () => await service.findOneOrThrow(id);
      await expect(findOneOrThrow).rejects.toThrowError("Milestone with given id does not exist.");
    });

    it("should return milestone", async () => {
      const added = await service.create({ title: 'existingMilestoneTitle', repositoryId } as MilestoneCreate);

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      const found = await service.findOneOrThrow(added._id);
      expect(found).not.toBeNull();
      expect(found._id + '').toBe(added._id + '');
    });
  });

  describe("create", () => {

    it("should throw DuplicateException because milestone title already exists in repository", async () => {
      const title = "existingTitle";
      const added = await service.create({ title, repositoryId } as MilestoneCreate);

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      const createDuplicate = async () => service.create({ title, repositoryId } as MilestoneCreate);
      await expect(createDuplicate).rejects.toThrowError("Milestone with same title already exists.");
    });

    it("should create new milestone", async () => {
      const createdMilestone = await service.create({
        title: "testCreate",
        description: "testDescription",
        dueDate,
        repositoryId
      } as MilestoneCreate);

      expect(createdMilestone).not.toBeNull();
      expect(createdMilestone).toHaveProperty("_id");
      expect(createdMilestone?.localId).toBe(1);
      expect(createdMilestone?.isOpen).toBe(true);
    });
  });

  describe("update", () => {

    it("should throw DuplicateException beacause milestone with same title exist", async () => {
      const firstMilestoneTitle = "firstMilestoneTitle";
      const firstMilestone = await service.create({ title: firstMilestoneTitle, repositoryId } as MilestoneCreate);

      expect(firstMilestone).not.toBeNull();
      expect(firstMilestone).toHaveProperty("_id");
      if (!firstMilestone) return;

      const secondMilestoneTitle = "secondMilestoneTitle";
      const secondMilestone = await service.create({ title: secondMilestoneTitle, repositoryId } as MilestoneCreate);

      expect(secondMilestone).not.toBeNull();
      expect(secondMilestone).toHaveProperty("_id");
      if (!secondMilestone) return;

      secondMilestone.title = firstMilestoneTitle;

      const updateDuplicate = async () => service.update(secondMilestone);
      await expect(updateDuplicate).rejects.toThrowError("Milestone with same title already exists.");
    });

    it("should throw MissingEnitiyException beacause milestone with given id does not exist", async () => {
      const updateDuplicate = async () => service.update({title: "noTitle", repositoryId} as MilestoneUpdate);
      await expect(updateDuplicate).rejects.toThrowError("Milestone with given id does not exist.");
    });

    it("should update milestone with every attibute changed", async () => {
      let toUpdateMilestone = await service.create({
        title: "testUpdate",
        description: "testDescriptionUpdate",
        dueDate,
        repositoryId
      } as MilestoneCreate) as Milestone;

      expect(toUpdateMilestone).not.toBeNull();
      expect(toUpdateMilestone).toHaveProperty("_id");

      toUpdateMilestone.title = "newTitle";
      toUpdateMilestone.description = "newDescription";
      toUpdateMilestone.dueDate = dueDate;

      const updatedMilestone = await service.update(toUpdateMilestone);
      expect(updatedMilestone?.title).toBe(toUpdateMilestone.title);
      expect(updatedMilestone?.description).toBe(toUpdateMilestone.description);
      expect(updatedMilestone?.dueDate+'').toBe(toUpdateMilestone.dueDate+'');
    });

    it("should update milestone without title changed", async () => {
      let toUpdateMilestone = await service.create({
        title: "testUpdateWithoutTitle",
        description: "testDescription",
        dueDate: undefined,
        repositoryId
      } as MilestoneCreate) as Milestone;

      expect(toUpdateMilestone).not.toBeNull();
      expect(toUpdateMilestone).toHaveProperty("_id");

      toUpdateMilestone.description = "newDescription";
      toUpdateMilestone.dueDate = dueDate;

      const updatedMilestone = await service.update(toUpdateMilestone);
      expect(updatedMilestone?.description).toBe(toUpdateMilestone.description);
      expect(updatedMilestone?.dueDate+'').toBe(toUpdateMilestone.dueDate+'');
    });
  });

  describe("delete", () => {

    it("should throw MissingEntityException beacuse localId does not exist", async () => {
      const localId = 123;

      const deleteNonExisting = async () => service.delete(repositoryId, localId);
      await expect(deleteNonExisting).rejects.toThrowError("Milestone with given id does not exist.");
    });

    it("should delete milestone", async () => {
      let toDeleteMilestone = await service.create({
        title: "testDelete",
        description: "testDescription",
        dueDate,
        repositoryId
      } as MilestoneCreate) as Milestone;

      expect(toDeleteMilestone).not.toBeNull();
      expect(toDeleteMilestone).toHaveProperty("_id");

      await service.delete(repositoryId, toDeleteMilestone.localId);

      const deletedMilestone = await service.findOne(toDeleteMilestone._id);
      expect(deletedMilestone).toBeNull();
    });
  });

  describe("close", () => {

    it("should delete milestone", async () => {
      let createdMilestone = await service.create({
        title: "testDelete",
        description: "testDescription",
        dueDate,
        repositoryId
      } as MilestoneCreate) as Milestone;

      expect(createdMilestone).not.toBeNull();
      expect(createdMilestone).toHaveProperty("_id");
      expect(createdMilestone?.isOpen).toBe(true);

      await service.changeStatus(repositoryId, createdMilestone.localId, false);

      const closedMilestone = await service.findOne(createdMilestone._id);
      expect(closedMilestone?.isOpen).toBe(false);
    });
  });
});