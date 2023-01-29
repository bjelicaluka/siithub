import { describe, expect, it, beforeEach } from "@jest/globals";
import { ObjectId } from "mongodb";
import { handleFor } from "../../../src/features/issue/issue.model";
import {
  type MilestoneAssignedEvent,
  type MilestoneUnassignedEvent,
} from "../../../src/features/common/events/events.model";
import { createEvent } from "../utils";

describe("CheckpointableHandlers", () => {
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

    it("should throw error milestone is already assigned", () => {
      const milestoneAssigned = createEvent<MilestoneAssignedEvent>({
        type: "MilestoneAssignedEvent",
        milestoneId: new ObjectId(),
      });

      const issue = {
        ...emptyIssue,
        events: [milestoneAssigned],
      };
      const assignMilestone = () => handleFor(issue, milestoneAssigned);

      expect(assignMilestone).toThrowError("Milestone is already assigned to the Issue.");
    });

    it("should throw error milestone is already reassigned", () => {
      const milestoneAssigned = createEvent<MilestoneAssignedEvent>({
        type: "MilestoneAssignedEvent",
        milestoneId: new ObjectId(),
      });
      const milestoneUnassigned = createEvent<MilestoneUnassignedEvent>({
        type: "MilestoneUnassignedEvent",
        milestoneId: milestoneAssigned.milestoneId,
      });

      const issue = {
        ...emptyIssue,
        events: [milestoneAssigned, milestoneUnassigned, milestoneAssigned],
      };
      const assignMilestone = () => handleFor(issue, milestoneAssigned);

      expect(assignMilestone).toThrowError("Milestone is already assigned to the Issue.");
    });

    it("should apply MilestoneAssignedEvent for the first time", () => {
      const milestoneAssigned = createEvent<MilestoneAssignedEvent>({
        type: "MilestoneAssignedEvent",
        milestoneId: new ObjectId(),
      });

      const issue = { ...emptyIssue };
      handleFor(issue, milestoneAssigned);
      expect(issue.csm.milestones).toEqual(expect.arrayContaining([milestoneAssigned.milestoneId]));
    });

    it("should apply MilestoneAssignedEvent after unassign", () => {
      const milestoneAssigned = createEvent<MilestoneAssignedEvent>({
        type: "MilestoneAssignedEvent",
        milestoneId: new ObjectId(),
      });
      const milestoneUnassigned = createEvent<MilestoneUnassignedEvent>({
        type: "MilestoneUnassignedEvent",
        milestoneId: milestoneAssigned.milestoneId,
      });

      const issue = {
        ...emptyIssue,
        events: [milestoneAssigned, milestoneUnassigned],
      };
      handleFor(issue, milestoneAssigned);
      expect(issue.csm.milestones).toEqual(expect.arrayContaining([milestoneAssigned.milestoneId]));
    });

    it("should throw error because milestone is not assigned", () => {
      const milestoneUnassigned = createEvent<MilestoneUnassignedEvent>({
        type: "MilestoneUnassignedEvent",
        milestoneId: new ObjectId(),
      });

      const issue = {
        ...emptyIssue,
      };
      const unassignMilestone = () => handleFor(issue, milestoneUnassigned);

      expect(unassignMilestone).toThrowError("Milestone cannot be unassigned from the Issue.");
    });

    it("should throw error because milestone is reunassigned", () => {
      const milestoneAssigned = createEvent<MilestoneAssignedEvent>({
        type: "MilestoneAssignedEvent",
        milestoneId: new ObjectId(),
      });
      const milestoneUnassigned = createEvent<MilestoneUnassignedEvent>({
        type: "MilestoneUnassignedEvent",
        milestoneId: milestoneAssigned.milestoneId,
      });

      const issue = {
        ...emptyIssue,
        events: [milestoneAssigned, milestoneUnassigned],
      };
      const unassignMilestone = () => handleFor(issue, milestoneUnassigned);

      expect(unassignMilestone).toThrowError("Milestone cannot be unassigned from the Issue.");
    });

    it("should apply MilestoneUnassignedEvent for the first time", () => {
      const milestoneAssigned = createEvent<MilestoneAssignedEvent>({
        type: "MilestoneAssignedEvent",
        milestoneId: new ObjectId(),
      });
      const milestoneUnassigned = createEvent<MilestoneUnassignedEvent>({
        type: "MilestoneUnassignedEvent",
        milestoneId: milestoneAssigned.milestoneId,
      });

      const issue = {
        ...emptyIssue,
        events: [milestoneAssigned],
      };
      handleFor(issue, milestoneUnassigned);
      expect(issue.csm.milestones).not.toEqual(expect.arrayContaining([milestoneAssigned.milestoneId]));
    });

    it("should apply MilestoneUnassignedEvent for after reassign", () => {
      const milestoneAssigned = createEvent<MilestoneAssignedEvent>({
        type: "MilestoneAssignedEvent",
        milestoneId: new ObjectId(),
      });
      const milestoneUnassigned = createEvent<MilestoneUnassignedEvent>({
        type: "MilestoneUnassignedEvent",
        milestoneId: milestoneAssigned.milestoneId,
      });

      const issue = {
        ...emptyIssue,
        events: [milestoneAssigned, milestoneUnassigned, milestoneAssigned],
      };
      handleFor(issue, milestoneUnassigned);
      expect(issue.csm.milestones).not.toEqual(expect.arrayContaining([milestoneAssigned.milestoneId]));
    });
  });
});
