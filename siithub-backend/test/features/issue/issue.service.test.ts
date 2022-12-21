import { describe, expect, it, beforeEach } from "@jest/globals";
import { setupTestEnv } from "../../jest-hooks.utils";
import { type IssueService } from "../../../src/features/issue/issue.service";
import { LabelAssignedEvent, UserAssignedEvent } from "../../../src/features/issue/issue.model";
import { createEvent } from './utils'
import { Label } from "../../../src/features/label/label.model";
import { User } from "../../../src/features/user/user.model";

describe("IssueService", () => {

  setupTestEnv("IssueService");

  let service: IssueService;

  beforeEach(async () => {
    const { issueService } = await import("../../../src/features/issue/issue.service");
    service = issueService;
  });


  describe("validateEventFor", () => {

    it("should throw exception because label does not exist", async () => {
      const labelAssigned = createEvent<LabelAssignedEvent>({
        type: 'LabelAssignedEvent',
        labelId: new Object()
      });

      const validateEvent = async () => await service.validateEventFor(labelAssigned);

      await expect(validateEvent).rejects.toThrowError()
    })

    it("should not throw when validating label assign", async () => {
      const { labelService } = await import("../../../src/features/label/label.service");
      const addedLabel = await labelService.create({ name: "Label"} as any) as Label;

      const labelAssigned = createEvent<LabelAssignedEvent>({
        type: 'LabelAssignedEvent',
        labelId: addedLabel._id
      });

      const validateEvent = async () => await service.validateEventFor(labelAssigned);

      expect(validateEvent).not.toThrowError()
    })

    it("should throw exception because user does not exist", async () => {
      const userAssigned = createEvent<UserAssignedEvent>({
        type: 'UserAssignedEvent',
        userId: new Object()
      });

      const validateEvent = async () => await service.validateEventFor(userAssigned);

      await expect(validateEvent).rejects.toThrowError()
    })

    it("should not throw when validating user assign", async () => {
      const { userService } = await import("../../../src/features/user/user.service");
      const addedUser = await userService.create({ username: "User"} as any) as User;

      const userAssigned = createEvent<UserAssignedEvent>({
        type: 'UserAssignedEvent',
        userId: addedUser._id
      });

      const validateEvent = async () => await service.validateEventFor(userAssigned);

      expect(validateEvent).not.toThrowError()
    })

  });
});
