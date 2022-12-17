import { describe, expect, it, beforeEach } from "@jest/globals";
import { setupTestEnv } from "../../jest-hooks.utils";
import { type LabelSeeder } from "../../../src/features/label/label.seeder";

describe("LabelSeeder", () => {
  setupTestEnv("LabelSeeder");

  let seeder : LabelSeeder;
 
  beforeEach(async () => {
    const { labelSeeder } = await import("../../../src/features/label/label.seeder")
    seeder = labelSeeder;
  });

  describe ("seedDefaultLabels", () => {
    it("should seed 7 new labels", async () => {
      const repositoryId = "testRId";
      const createdLabels = await seeder.seedDefaultLabels(repositoryId);

      expect(createdLabels).not.toBeFalsy();
      expect(createdLabels?.length).toBe(7);
    });
  });
})