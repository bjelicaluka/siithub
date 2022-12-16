import { describe, expect, it, beforeEach, beforeAll } from "@jest/globals";
import { setupTestEnv } from "../../jest-hooks.utils";
import { type LabelService } from "../../../src/features/label/label.service";
import { type Label } from "../../../src/features/label/label.model";

describe("LabelService", () => {
  setupTestEnv("LabelService");

  let service: LabelService;

  beforeEach(async () => {
    const { labelService } = await import("../../../src/features/label/label.service");
    service = labelService;
  });

  describe("create", () => {

    it("should throw DuplicateException because label name already exists in repository", async () => {
      const name = "existingName";
      const added = await service.create({ name } as any);

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      const createDuplicate = async () => service.create({ name } as any);
      await expect(createDuplicate).rejects.toThrowError("Label with same name already exists.");
    });

    it("should create new label", async () => {
      const createdLabel = await service.create({
        name: "testCreate",
        description: "testDescription",
        color: "#d4e2455",
        repositoryId: "testRepoId"
      });

      expect(createdLabel).not.toBeNull();
      expect(createdLabel).toHaveProperty("_id");
    });
  });

  describe("update", () => {

    it("should throw DuplicateException beacause label with same name exist", async () => {
      const firstLabelName = "firstLabelName";
      const firstLabel = await service.create({ name: firstLabelName } as any);

      expect(firstLabel).not.toBeNull();
      expect(firstLabel).toHaveProperty("_id");
      if (!firstLabel) return;

      const secondLabelName = "secondLabelName";
      const secondLabel = await service.create({ name: secondLabelName } as any);

      expect(secondLabel).not.toBeNull();
      expect(secondLabel).toHaveProperty("_id");
      if (!secondLabel) return;

      secondLabel.name = firstLabelName;

      const updateDuplicate = async () => service.update(secondLabel);
      await expect(updateDuplicate).rejects.toThrowError("Label with same name already exists.");
    });

    it("should throw MissingEnitiyException beacause label with given id does not exist", async () => {
      const updateDuplicate = async () => service.update({name: "noName"} as any);
      await expect(updateDuplicate).rejects.toThrowError("Label with given id does not exist.");
    });

    it("should update label with every attibute changed", async () => {
      let toUpdateLabel = await service.create({
        name: "testUpdate",
        description: "testDescriptionUpdate",
        color: "#d4e2455",
        repositoryId: "testRepoIdUpdate"
      }) as Label;

      expect(toUpdateLabel).not.toBeNull();
      expect(toUpdateLabel).toHaveProperty("_id");

      toUpdateLabel.name = "newName";
      toUpdateLabel.description = "newDescription";
      toUpdateLabel.color = "#d4e111";

      const updatedLabel = await service.update(toUpdateLabel);
      expect(updatedLabel?.name).toBe(toUpdateLabel.name);
      expect(updatedLabel?.description).toBe(toUpdateLabel.description);
      expect(updatedLabel?.color).toBe(toUpdateLabel.color);
    });

    it("should update label without name changed", async () => {
      let toUpdateLabel = await service.create({
        name: "testUpdateWithoutName",
        description: "testDescription",
        color: "#d4e2455",
        repositoryId: "testRepoId"
      }) as Label;

      expect(toUpdateLabel).not.toBeNull();
      expect(toUpdateLabel).toHaveProperty("_id");

      toUpdateLabel.description = "newDescription";
      toUpdateLabel.color = "#d4e111";

      const updatedLabel = await service.update(toUpdateLabel);
      expect(updatedLabel?.description).toBe(toUpdateLabel.description);
      expect(updatedLabel?.color).toBe(toUpdateLabel.color);
    });
  });

  describe("delete", () => {

    it("should throw MissingEntityException beacuse id does not exist", async () => {
      const _id = "nonExistingId";

      const deleteNonExisting = async () => service.delete({ _id } as any);
      await expect(deleteNonExisting).rejects.toThrowError("Label with given id does not exist.");
    });

    it("should delete label", async () => {
      let toDeleteLabel = await service.create({
        name: "testDelete",
        description: "testDescription",
        color: "#d4e2455",
        repositoryId: "testRepoId"
      }) as Label;

      expect(toDeleteLabel).not.toBeNull();
      expect(toDeleteLabel).toHaveProperty("_id");

      await service.delete(toDeleteLabel._id);

      const deletedLabel = await service.findOne(toDeleteLabel._id);
      expect(deletedLabel).toBeNull();
    });
  });
});