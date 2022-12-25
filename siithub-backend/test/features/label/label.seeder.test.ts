import { describe, expect, it, beforeEach } from "@jest/globals";
import { setupTestEnv } from "../../jest-hooks.utils";
import { type LabelSeeder } from "../../../src/features/label/label.seeder";
import { type Repository } from "../../../src/features/repository/repository.model";

describe("LabelSeeder", () => {
  setupTestEnv("LabelSeeder");

  let seeder : LabelSeeder;
  let repositoryId: Repository["_id"];

  beforeEach(async () => {
    const { labelSeeder } = await import("../../../src/features/label/label.seeder")
    const { repositoryRepo } = await import("../../../src/features/repository/repository.repo")

    seeder = labelSeeder;
    repositoryId = (await repositoryRepo.crud.add({
			name: 'repoForLabels'
		} as any) as Repository)?._id;

  });

  describe ("seedDefaultLabels", () => {
    it("should seed 7 new labels", async () => {
      const createdLabels = await seeder.seedDefaultLabels(repositoryId);

      expect(createdLabels).not.toBeFalsy();
      expect(createdLabels?.length).toBe(7);
    });
  });
})