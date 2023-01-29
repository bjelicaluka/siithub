import { describe, expect, it, beforeEach } from "@jest/globals";
import { ObjectId } from "mongodb";
import { handleFor } from "../../../src/features/issue/issue.model";
import { type UserAssignedEvent, type UserUnassignedEvent } from "../../../src/features/common/events/events.model";
import { createEvent } from "../utils";

describe("AssignableModel", () => {
  describe("handleFor", () => {
    let emptyIssue: any = {};

    beforeEach(() => {
      emptyIssue = {
        _id: new ObjectId(),
        repositoryId: "someRepositoryId",
        csm: {
          labels: [],
          assignees: [],
          milestones: [],
          comments: [],
        },
        events: [],
      };
    });

    it("should throw error user is already assigned", () => {
      const userAssigned = createEvent<UserAssignedEvent>({
        type: "UserAssignedEvent",
        userId: new ObjectId(),
      });

      const issue = {
        ...emptyIssue,
        events: [userAssigned],
      };
      const assignUser = () => handleFor(issue, userAssigned);

      expect(assignUser).toThrowError("User is already assigned to the Issue.");
    });

    it("should throw error user is already reassigned", () => {
      const userAssigned = createEvent<UserAssignedEvent>({
        type: "UserAssignedEvent",
        userId: new ObjectId(),
      });
      const userUnassigned = createEvent<UserUnassignedEvent>({
        type: "UserUnassignedEvent",
        userId: userAssigned.userId,
      });

      const issue = {
        ...emptyIssue,
        events: [userAssigned, userUnassigned, userAssigned],
      };
      const assignUser = () => handleFor(issue, userAssigned);

      expect(assignUser).toThrowError("User is already assigned to the Issue.");
    });

    it("should apply UserAssignedEvent for the first time", () => {
      const userAssigned = createEvent<UserAssignedEvent>({
        type: "UserAssignedEvent",
        userId: new ObjectId(),
      });

      const issue = { ...emptyIssue };
      handleFor(issue, userAssigned);
      expect(issue.csm.assignees).toEqual(expect.arrayContaining([userAssigned.userId]));
    });

    it("should apply UserAssignedEvent after unassign", () => {
      const userAssigned = createEvent<UserAssignedEvent>({
        type: "UserAssignedEvent",
        userId: new ObjectId(),
      });
      const userUnassigned = createEvent<UserUnassignedEvent>({
        type: "UserUnassignedEvent",
        userId: userAssigned.userId,
      });

      const issue = {
        ...emptyIssue,
        events: [userAssigned, userUnassigned],
      };
      handleFor(issue, userAssigned);
      expect(issue.csm.assignees).toEqual(expect.arrayContaining([userAssigned.userId]));
    });

    it("should throw error because user is not assigned", () => {
      const userUnassigned = createEvent<UserUnassignedEvent>({
        type: "UserUnassignedEvent",
        userId: new ObjectId(),
      });

      const issue = {
        ...emptyIssue,
      };
      const unassignUser = () => handleFor(issue, userUnassigned);

      expect(unassignUser).toThrowError("User cannot be unassigned from the Issue.");
    });

    it("should throw error because user is reunassigned", () => {
      const userAssigned = createEvent<UserAssignedEvent>({
        type: "UserAssignedEvent",
        userId: new ObjectId(),
      });
      const userUnassigned = createEvent<UserUnassignedEvent>({
        type: "UserUnassignedEvent",
        userId: userAssigned.userId,
      });

      const issue = {
        ...emptyIssue,
        events: [userAssigned, userUnassigned],
      };
      const unassignUser = () => handleFor(issue, userUnassigned);

      expect(unassignUser).toThrowError("User cannot be unassigned from the Issue.");
    });

    it("should apply UserUnassignedEvent for the first time", () => {
      const userAssigned = createEvent<UserAssignedEvent>({
        type: "UserAssignedEvent",
        userId: new ObjectId(),
      });
      const userUnassigned = createEvent<UserUnassignedEvent>({
        type: "UserUnassignedEvent",
        userId: userAssigned.userId,
      });

      const issue = {
        ...emptyIssue,
        events: [userAssigned],
      };
      handleFor(issue, userUnassigned);
      expect(issue.csm.assignees).not.toEqual(expect.arrayContaining([userAssigned.userId]));
    });

    it("should apply UserUnassignedEvent for after reassign", () => {
      const userAssigned = createEvent<UserAssignedEvent>({
        type: "UserAssignedEvent",
        userId: new ObjectId(),
      });
      const userUnassigned = createEvent<UserUnassignedEvent>({
        type: "UserUnassignedEvent",
        userId: userAssigned.userId,
      });

      const issue = {
        ...emptyIssue,
        events: [userAssigned, userUnassigned, userAssigned],
      };
      handleFor(issue, userUnassigned);
      expect(issue.csm.assignees).not.toEqual(expect.arrayContaining([userAssigned.userId]));
    });
  });
});
