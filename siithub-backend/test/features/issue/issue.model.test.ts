import { describe, expect, it, beforeEach } from "@jest/globals";
import { ObjectId } from "mongodb";

import { handleFor, IssueClosedEvent, IssueCreatedEvent, IssueReopenedEvent, IssueState, IssueUpdatedEvent, LabelAssignedEvent, LabelUnassignedEvent, UserAssignedEvent, UserUnassignedEvent } from '../../../src/features/issue/issue.model'
import { createEvent } from './utils'

describe("IssueModel", () => {

  describe("handleFor", () => {

    let emptyIssue: any = {};

    beforeEach(() => {
      emptyIssue = {
        _id: new ObjectId(),
        repositoryId: "someRepositoryId",
        csm: {
          labels: [],
          assignees: []
        },
        events: []
      }
    })
    

    it ("should add event to events", () => {
      const issueCreated = createEvent<IssueCreatedEvent>({
        type: 'IssueCreatedEvent',
        title: 'Issue Created',
        description: 'This issue has been created.'
      });

      const issue = { ...emptyIssue };
      const numOfEvents = issue.events.length;
      handleFor(issue, issueCreated);

      expect(issue.events.length).toEqual(numOfEvents + 1);
    })

    it ("should apply IssueCreatedEvent", () => {
      const issueCreated = createEvent<IssueCreatedEvent>({
        type: 'IssueCreatedEvent',
        title: 'Issue Created',
        description: 'This issue has been created.'
      });

      const issue = { ...emptyIssue };
      handleFor(issue, issueCreated);

      expect(issue.csm).toEqual(expect.objectContaining({
        title: issueCreated.title,
        description: issueCreated.description,
        state: IssueState.Open,
        labels: [],
        assignees: []
      }));
    })

    it ("should apply IssueUpdatedEvent", () => {
      const issueUpdated = createEvent<IssueUpdatedEvent>({
        type: 'IssueUpdatedEvent',
        title: 'Issue Updated',
        description: 'This issue has been updated.'
      });

      const issue = {
        ...emptyIssue,
        title: 'Issue Created',
        description: 'This issue has been created.'
      };
      handleFor(issue, issueUpdated);

      expect(issue.csm).toEqual(expect.objectContaining({
        title: issueUpdated.title,
        description: issueUpdated.description
      }));
    })

    it ("should throw error label is already assigned", () => {
      const labelAssigned = createEvent<LabelAssignedEvent>({
        type: 'LabelAssignedEvent',
        labelId: new ObjectId()
      });

      const issue = {
        ...emptyIssue,
        events: [labelAssigned]
      };
      const assignLabel = () => handleFor(issue, labelAssigned);

      expect(assignLabel).toThrowError("Label is already assigned to the Issue.");
    })

    it ("should throw error label is already reassigned", () => {
      const labelAssigned = createEvent<LabelAssignedEvent>({
        type: 'LabelAssignedEvent',
        labelId: new ObjectId()
      });
      const labelUnassigned = createEvent<LabelUnassignedEvent>({
        type: 'LabelUnassignedEvent',
        labelId: labelAssigned.labelId
      });

      const issue = {
        ...emptyIssue,
        events: [labelAssigned, labelUnassigned, labelAssigned]
      };
      const assignLabel = () => handleFor(issue, labelAssigned);

      expect(assignLabel).toThrowError("Label is already assigned to the Issue.");
    })

    it ("should apply LabelAssignedEvent for the first time", () => {
      const labelAssigned = createEvent<LabelAssignedEvent>({
        type: 'LabelAssignedEvent',
        labelId: new ObjectId()
      });

      const issue = { ...emptyIssue };
      handleFor(issue, labelAssigned);
      expect(issue.csm.labels).toEqual(expect.arrayContaining([labelAssigned.labelId]));
    })

    it ("should apply LabelAssignedEvent after unassign", () => {
      const labelAssigned = createEvent<LabelAssignedEvent>({
        type: 'LabelAssignedEvent',
        labelId: new ObjectId()
      });
      const labelUnassigned = createEvent<LabelUnassignedEvent>({
        type: 'LabelUnassignedEvent',
        labelId: labelAssigned.labelId
      });

      const issue = {
        ...emptyIssue,
        events: [labelAssigned, labelUnassigned]
      };
      handleFor(issue, labelAssigned);
      expect(issue.csm.labels).toEqual(expect.arrayContaining([labelAssigned.labelId]));
    })

    it ("should throw error because label is not assigned", () => {
      const labelUnassigned = createEvent<LabelUnassignedEvent>({
        type: 'LabelUnassignedEvent',
        labelId: new ObjectId()
      });

      const issue = {
        ...emptyIssue,
      };
      const unassignLabel = () => handleFor(issue, labelUnassigned);

      expect(unassignLabel).toThrowError("Label cannot be unassigned from the Issue.");
    })

    it ("should throw error because label is reunassigned", () => {
      const labelAssigned = createEvent<LabelAssignedEvent>({
        type: 'LabelAssignedEvent',
        labelId: new ObjectId()
      });
      const labelUnassigned = createEvent<LabelUnassignedEvent>({
        type: 'LabelUnassignedEvent',
        labelId: labelAssigned.labelId
      });

      const issue = {
        ...emptyIssue,
        events: [labelAssigned, labelUnassigned]
      };
      const unassignLabel = () => handleFor(issue, labelUnassigned);

      expect(unassignLabel).toThrowError("Label cannot be unassigned from the Issue.");
    })

    it ("should apply LabelUnassignedEvent for the first time", () => {
      const labelAssigned = createEvent<LabelAssignedEvent>({
        type: 'LabelAssignedEvent',
        labelId: new ObjectId()
      });
      const labelUnassigned = createEvent<LabelUnassignedEvent>({
        type: 'LabelUnassignedEvent',
        labelId: labelAssigned.labelId
      });

      const issue = {
        ...emptyIssue,
        events: [labelAssigned]
      };
      handleFor(issue, labelUnassigned);
      expect(issue.csm.labels).not.toEqual(expect.arrayContaining([labelAssigned.labelId]));

    })

    it ("should apply LabelUnassignedEvent for after reassign", () => {
      const labelAssigned = createEvent<LabelAssignedEvent>({
        type: 'LabelAssignedEvent',
        labelId: new ObjectId()
      });
      const labelUnassigned = createEvent<LabelUnassignedEvent>({
        type: 'LabelUnassignedEvent',
        labelId: labelAssigned.labelId
      });

      const issue = {
        ...emptyIssue,
        events: [labelAssigned, labelUnassigned, labelAssigned]
      };
      handleFor(issue, labelUnassigned);
      expect(issue.csm.labels).not.toEqual(expect.arrayContaining([labelAssigned.labelId]));

    })

    it ("should throw error user is already assigned", () => {
      const userAssigned = createEvent<UserAssignedEvent>({
        type: 'UserAssignedEvent',
        userId: new ObjectId()
      });

      const issue = {
        ...emptyIssue,
        events: [userAssigned]
      };
      const assignUser = () => handleFor(issue, userAssigned);

      expect(assignUser).toThrowError("User is already assigned to the Issue.");
    })

    it ("should throw error user is already reassigned", () => {
      const userAssigned = createEvent<UserAssignedEvent>({
        type: 'UserAssignedEvent',
        userId: new ObjectId()
      });
      const userUnassigned = createEvent<UserUnassignedEvent>({
        type: 'UserUnassignedEvent',
        userId: userAssigned.userId
      });

      const issue = {
        ...emptyIssue,
        events: [userAssigned, userUnassigned, userAssigned]
      };
      const assignUser = () => handleFor(issue, userAssigned);

      expect(assignUser).toThrowError("User is already assigned to the Issue.");
    })

    it ("should apply UserAssignedEvent for the first time", () => {
      const userAssigned = createEvent<UserAssignedEvent>({
        type: 'UserAssignedEvent',
        userId: new ObjectId()
      });

      const issue = { ...emptyIssue };
      handleFor(issue, userAssigned);
      expect(issue.csm.assignees).toEqual(expect.arrayContaining([userAssigned.userId]));
    })

    it ("should apply UserAssignedEvent after unassign", () => {
      const userAssigned = createEvent<UserAssignedEvent>({
        type: 'UserAssignedEvent',
        userId: new ObjectId()
      });
      const userUnassigned = createEvent<UserUnassignedEvent>({
        type: 'UserUnassignedEvent',
        userId: userAssigned.userId
      });

      const issue = {
        ...emptyIssue,
        events: [userAssigned, userUnassigned]
      };
      handleFor(issue, userAssigned);
      expect(issue.csm.assignees).toEqual(expect.arrayContaining([userAssigned.userId]));
    })

    it ("should throw error because user is not assigned", () => {
      const userUnassigned = createEvent<UserUnassignedEvent>({
        type: 'UserUnassignedEvent',
        userId: new ObjectId()
      });

      const issue = {
        ...emptyIssue,
      };
      const unassignUser = () => handleFor(issue, userUnassigned);

      expect(unassignUser).toThrowError("User cannot be unassigned from the Issue.");
    })

    it ("should throw error because user is reunassigned", () => {
      const userAssigned = createEvent<UserAssignedEvent>({
        type: 'UserAssignedEvent',
        userId: new ObjectId()
      });
      const userUnassigned = createEvent<UserUnassignedEvent>({
        type: 'UserUnassignedEvent',
        userId: userAssigned.userId
      });

      const issue = {
        ...emptyIssue,
        events: [userAssigned, userUnassigned]
      };
      const unassignUser = () => handleFor(issue, userUnassigned);

      expect(unassignUser).toThrowError("User cannot be unassigned from the Issue.");
    })

    it ("should apply UserUnassignedEvent for the first time", () => {
      const userAssigned = createEvent<UserAssignedEvent>({
        type: 'UserAssignedEvent',
        userId: new ObjectId()
      });
      const userUnassigned = createEvent<UserUnassignedEvent>({
        type: 'UserUnassignedEvent',
        userId: userAssigned.userId
      });

      const issue = {
        ...emptyIssue,
        events: [userAssigned]
      };
      handleFor(issue, userUnassigned);
      expect(issue.csm.assignees).not.toEqual(expect.arrayContaining([userAssigned.userId]));

    })

    it ("should apply UserUnassignedEvent for after reassign", () => {
      const userAssigned = createEvent<UserAssignedEvent>({
        type: 'UserAssignedEvent',
        userId: new ObjectId()
      });
      const userUnassigned = createEvent<UserUnassignedEvent>({
        type: 'UserUnassignedEvent',
        userId: userAssigned.userId
      });

      const issue = {
        ...emptyIssue,
        events: [userAssigned, userUnassigned, userAssigned]
      };
      handleFor(issue, userUnassigned);
      expect(issue.csm.assignees).not.toEqual(expect.arrayContaining([userAssigned.userId]));

    })

    it ("should throw error because issue is not created", () => {
      const issueReopened = createEvent<IssueReopenedEvent>({
        type: 'IssueReopenedEvent',
      });

      const issue = {
        ...emptyIssue,
      };
      const reopenIssue = () => handleFor(issue, issueReopened);

      expect(reopenIssue).toThrowError("Issue cannot be reopened.");
    })

    it ("should throw error because issue is created but not closed", () => {
      const issueCreated = createEvent<IssueCreatedEvent>({
        type: 'IssueCreatedEvent',
        title: 'Issue Created'
      });
      const issueReopened = createEvent<IssueReopenedEvent>({
        type: 'IssueReopenedEvent',
      });

      const issue = {
        ...emptyIssue,
        events: [issueCreated, issueReopened]
      };
      const reopenIssue = () => handleFor(issue, issueReopened);

      expect(reopenIssue).toThrowError("Issue cannot be reopened.");
    })

    it ("should throw error because issue is reopened", () => {
      const issueCreated = createEvent<IssueCreatedEvent>({
        type: 'IssueCreatedEvent',
        title: 'Issue Created'
      });
      const issueReopened = createEvent<IssueReopenedEvent>({
        type: 'IssueReopenedEvent',
      });
      const issueClosed = createEvent<IssueClosedEvent>({
        type: 'IssueClosedEvent',
      });

      const issue = {
        ...emptyIssue,
        events: [issueCreated, issueClosed, issueReopened]
      };
      const reopenIssue = () => handleFor(issue, issueReopened);

      expect(reopenIssue).toThrowError("Issue cannot be reopened.");
    })

    it ("should apply IssueReopenedEvent", () => {
      const issueCreated = createEvent<IssueCreatedEvent>({
        type: 'IssueCreatedEvent',
        title: 'Issue Created'
      });
      const issueReopened = createEvent<IssueReopenedEvent>({
        type: 'IssueReopenedEvent',
      });
      const issueClosed = createEvent<IssueClosedEvent>({
        type: 'IssueClosedEvent',
      });

      const issue = {
        ...emptyIssue,
        events: [issueCreated, issueClosed]
      };
      handleFor(issue, issueReopened);

      expect(issue.csm).toHaveProperty("state", IssueState.Reopened);
    })

    it ("should throw error because issue is not created", () => {
      const issueClosed = createEvent<IssueClosedEvent>({
        type: 'IssueClosedEvent',
      });

      const issue = {
        ...emptyIssue,
      };
      const closeIssue = () => handleFor(issue, issueClosed);

      expect(closeIssue).toThrowError("Issue cannot be closed.");
    })

    it ("should apply IssueClosedEvent after opening", () => {
      const issueCreated = createEvent<IssueCreatedEvent>({
        type: 'IssueCreatedEvent',
        title: 'Issue Created'
      });
      const issueClosed = createEvent<IssueClosedEvent>({
        type: 'IssueClosedEvent',
      });

      const issue = {
        ...emptyIssue,
        events: [issueCreated]
      };
      handleFor(issue, issueClosed);

      expect(issue.csm).toHaveProperty("state", IssueState.Closed);
    })

    it ("should apply IssueClosedEvent after reopening", () => {
      const issueCreated = createEvent<IssueCreatedEvent>({
        type: 'IssueCreatedEvent',
        title: 'Issue Created'
      });
      const issueReopened = createEvent<IssueReopenedEvent>({
        type: 'IssueReopenedEvent',
      });
      const issueClosed = createEvent<IssueClosedEvent>({
        type: 'IssueClosedEvent',
      });

      const issue = {
        ...emptyIssue,
        events: [issueCreated, issueClosed, issueReopened]
      };
      handleFor(issue, issueClosed);

      expect(issue.csm).toHaveProperty("state", IssueState.Closed);
    })

    it ("should throw error because type does not exist", () => {
      const nonExistingEvent = createEvent<any>({
        type: 'NonExistingEvent',
      });

      const issue = { ...emptyIssue };
      const handleIssue = () => handleFor(issue, nonExistingEvent);

      expect(handleIssue).toThrowError();
    })
  });
})