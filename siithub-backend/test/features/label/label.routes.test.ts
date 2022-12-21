import { describe, expect, it } from "@jest/globals";
import { labelBodySchema } from "../../../src/features/label/label.routes"

describe("LabelRoutes", () => {

  describe("labelBodySchema", () => {
    const validCreateLabel = {
      name: "testName",
      description: "testDescr",
      color: "d4c5f9"
    }

    it("should be invalid because name is too short", () => {
      const invalidCreateLabel = {
        ...validCreateLabel,
        name: "na"
      };

      const parseResult = labelBodySchema.safeParse(invalidCreateLabel);
      
      expect(parseResult.success).toBeFalsy();
      if (parseResult.success) return;

      expect(parseResult.error.issues).toContainEqual(expect.objectContaining({
        message: "Name should have at least 3 characters."
      }));
    });

    it("should be invalid beacuse name contains non-alphanumeric characters", () => {
      const invalidCreateLabel = {
        ...validCreateLabel,
        name: "na$#"
      };

      const parseResult = labelBodySchema.safeParse(invalidCreateLabel);
      
      expect(parseResult.success).toBeFalsy();
      if (parseResult.success) return;

      expect(parseResult.error.issues).toContainEqual(expect.objectContaining({
        message: "Name should contain only alphanumeric characters."
      }));
    });

    it("invalid beacuse color contains non-hexadecimal characters", () => {
      const invalidCreateLabel = {
        ...validCreateLabel,
        color: "12tttt"
      };

      const parseResult = labelBodySchema.safeParse(invalidCreateLabel);
      
      expect(parseResult.success).toBeFalsy();
      if (parseResult.success) return;

      expect(parseResult.error.issues).toContainEqual(expect.objectContaining({
        message: "Color should contain only hexadecimal numbers."
      }));
    });

    it("valid", () => {
      const parseResult = labelBodySchema.safeParse(validCreateLabel);
      expect(parseResult.success).toBeTruthy();
    });

  });
});