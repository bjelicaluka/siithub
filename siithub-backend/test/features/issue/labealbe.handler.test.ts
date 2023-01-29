import { describe, expect, it, beforeEach } from "@jest/globals";
import { ObjectId } from "mongodb";
import { type LabelAssignedEvent, type LabelUnassignedEvent } from "../../../src/features/common/events/events.model";
import { createEvent } from "../utils";
import { handleFor } from "../../../src/features/issue/issue.model";

describe("LabeableHandlers", () => {
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

    it("should throw error label is already assigned", () => {
      const labelAssigned = createEvent<LabelAssignedEvent>({
        type: "LabelAssignedEvent",
        labelId: new ObjectId(),
      });

      const issue = {
        ...emptyIssue,
        events: [labelAssigned],
      };
      const assignLabel = () => handleFor(issue, labelAssigned);

      expect(assignLabel).toThrowError("Label is already assigned to the Issue.");
    });

    it("should throw error label is already reassigned", () => {
      const labelAssigned = createEvent<LabelAssignedEvent>({
        type: "LabelAssignedEvent",
        labelId: new ObjectId(),
      });
      const labelUnassigned = createEvent<LabelUnassignedEvent>({
        type: "LabelUnassignedEvent",
        labelId: labelAssigned.labelId,
      });

      const issue = {
        ...emptyIssue,
        events: [labelAssigned, labelUnassigned, labelAssigned],
      };
      const assignLabel = () => handleFor(issue, labelAssigned);

      expect(assignLabel).toThrowError("Label is already assigned to the Issue.");
    });

    it("should apply LabelAssignedEvent for the first time", () => {
      const labelAssigned = createEvent<LabelAssignedEvent>({
        type: "LabelAssignedEvent",
        labelId: new ObjectId(),
      });

      const issue = { ...emptyIssue };
      handleFor(issue, labelAssigned);
      expect(issue.csm.labels).toEqual(expect.arrayContaining([labelAssigned.labelId]));
    });

    it("should apply LabelAssignedEvent after unassign", () => {
      const labelAssigned = createEvent<LabelAssignedEvent>({
        type: "LabelAssignedEvent",
        labelId: new ObjectId(),
      });
      const labelUnassigned = createEvent<LabelUnassignedEvent>({
        type: "LabelUnassignedEvent",
        labelId: labelAssigned.labelId,
      });

      const issue = {
        ...emptyIssue,
        events: [labelAssigned, labelUnassigned],
      };
      handleFor(issue, labelAssigned);
      expect(issue.csm.labels).toEqual(expect.arrayContaining([labelAssigned.labelId]));
    });

    it("should throw error because label is not assigned", () => {
      const labelUnassigned = createEvent<LabelUnassignedEvent>({
        type: "LabelUnassignedEvent",
        labelId: new ObjectId(),
      });

      const issue = {
        ...emptyIssue,
      };
      const unassignLabel = () => handleFor(issue, labelUnassigned);

      expect(unassignLabel).toThrowError("Label cannot be unassigned from the Issue.");
    });

    it("should throw error because label is reunassigned", () => {
      const labelAssigned = createEvent<LabelAssignedEvent>({
        type: "LabelAssignedEvent",
        labelId: new ObjectId(),
      });
      const labelUnassigned = createEvent<LabelUnassignedEvent>({
        type: "LabelUnassignedEvent",
        labelId: labelAssigned.labelId,
      });

      const issue = {
        ...emptyIssue,
        events: [labelAssigned, labelUnassigned],
      };
      const unassignLabel = () => handleFor(issue, labelUnassigned);

      expect(unassignLabel).toThrowError("Label cannot be unassigned from the Issue.");
    });

    it("should apply LabelUnassignedEvent for the first time", () => {
      const labelAssigned = createEvent<LabelAssignedEvent>({
        type: "LabelAssignedEvent",
        labelId: new ObjectId(),
      });
      const labelUnassigned = createEvent<LabelUnassignedEvent>({
        type: "LabelUnassignedEvent",
        labelId: labelAssigned.labelId,
      });

      const issue = {
        ...emptyIssue,
        events: [labelAssigned],
      };
      handleFor(issue, labelUnassigned);
      expect(issue.csm.labels).not.toEqual(expect.arrayContaining([labelAssigned.labelId]));
    });

    it("should apply LabelUnassignedEvent for after reassign", () => {
      const labelAssigned = createEvent<LabelAssignedEvent>({
        type: "LabelAssignedEvent",
        labelId: new ObjectId(),
      });
      const labelUnassigned = createEvent<LabelUnassignedEvent>({
        type: "LabelUnassignedEvent",
        labelId: labelAssigned.labelId,
      });

      const issue = {
        ...emptyIssue,
        events: [labelAssigned, labelUnassigned, labelAssigned],
      };
      handleFor(issue, labelUnassigned);
      expect(issue.csm.labels).not.toEqual(expect.arrayContaining([labelAssigned.labelId]));
    });
  });
});
