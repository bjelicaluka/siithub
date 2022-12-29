import { describe, expect, it, beforeEach } from "@jest/globals";
import { ObjectId } from "mongodb";
import { handleFor, type IssueClosedEvent, type IssueCreatedEvent, type IssueReopenedEvent, IssueState, type IssueUpdatedEvent, type LabelAssignedEvent, type LabelUnassignedEvent, type UserAssignedEvent, type UserUnassignedEvent, type MilestoneAssignedEvent, type MilestoneUnassignedEvent, CommentCreatedEvent, CommentUpdatedEvent, CommentHiddenEvent, CommentDeletedEvent, CommentState } from '../../../src/features/issue/issue.model'
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
          assignees: [],
          milestones: [],
          comments: []
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
        assignees: [],
        milestones: []
      }));
      expect(issue.csm).toHaveProperty("timeStamp")
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
      expect(issue.csm).toHaveProperty("lastModified")
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

    it ("should throw error milestone is already assigned", () => {
      const milestoneAssigned = createEvent<MilestoneAssignedEvent>({
        type: 'MilestoneAssignedEvent',
        milestoneId: new ObjectId()
      });

      const issue = {
        ...emptyIssue,
        events: [milestoneAssigned]
      };
      const assignMilestone = () => handleFor(issue, milestoneAssigned);

      expect(assignMilestone).toThrowError("Milestone is already assigned to the Issue.");
    })

    it ("should throw error milestone is already reassigned", () => {
      const milestoneAssigned = createEvent<MilestoneAssignedEvent>({
        type: 'MilestoneAssignedEvent',
        milestoneId: new ObjectId()
      });
      const milestoneUnassigned = createEvent<MilestoneUnassignedEvent>({
        type: 'MilestoneUnassignedEvent',
        milestoneId: milestoneAssigned.milestoneId
      });

      const issue = {
        ...emptyIssue,
        events: [milestoneAssigned, milestoneUnassigned, milestoneAssigned]
      };
      const assignMilestone = () => handleFor(issue, milestoneAssigned);

      expect(assignMilestone).toThrowError("Milestone is already assigned to the Issue.");
    })

    it ("should apply MilestoneAssignedEvent for the first time", () => {
      const milestoneAssigned = createEvent<MilestoneAssignedEvent>({
        type: 'MilestoneAssignedEvent',
        milestoneId: new ObjectId()
      });

      const issue = { ...emptyIssue };
      handleFor(issue, milestoneAssigned);
      expect(issue.csm.milestones).toEqual(expect.arrayContaining([milestoneAssigned.milestoneId]));
    })

    it ("should apply MilestoneAssignedEvent after unassign", () => {
      const milestoneAssigned = createEvent<MilestoneAssignedEvent>({
        type: 'MilestoneAssignedEvent',
        milestoneId: new ObjectId()
      });
      const milestoneUnassigned = createEvent<MilestoneUnassignedEvent>({
        type: 'MilestoneUnassignedEvent',
        milestoneId: milestoneAssigned.milestoneId
      });

      const issue = {
        ...emptyIssue,
        events: [milestoneAssigned, milestoneUnassigned]
      };
      handleFor(issue, milestoneAssigned);
      expect(issue.csm.milestones).toEqual(expect.arrayContaining([milestoneAssigned.milestoneId]));
    })
    
    it ("should throw error because milestone is not assigned", () => {
      const milestoneUnassigned = createEvent<MilestoneUnassignedEvent>({
        type: 'MilestoneUnassignedEvent',
        milestoneId: new ObjectId()
      });

      const issue = {
        ...emptyIssue,
      };
      const unassignMilestone = () => handleFor(issue, milestoneUnassigned);

      expect(unassignMilestone).toThrowError("Milestone cannot be unassigned from the Issue.");
    })

    it ("should throw error because milestone is reunassigned", () => {
      const milestoneAssigned = createEvent<MilestoneAssignedEvent>({
        type: 'MilestoneAssignedEvent',
        milestoneId: new ObjectId()
      });
      const milestoneUnassigned = createEvent<MilestoneUnassignedEvent>({
        type: 'MilestoneUnassignedEvent',
        milestoneId: milestoneAssigned.milestoneId
      });

      const issue = {
        ...emptyIssue,
        events: [milestoneAssigned, milestoneUnassigned]
      };
      const unassignMilestone = () => handleFor(issue, milestoneUnassigned);

      expect(unassignMilestone).toThrowError("Milestone cannot be unassigned from the Issue.");
    })

    it ("should apply MilestoneUnassignedEvent for the first time", () => {
      const milestoneAssigned = createEvent<MilestoneAssignedEvent>({
        type: 'MilestoneAssignedEvent',
        milestoneId: new ObjectId()
      });
      const milestoneUnassigned = createEvent<MilestoneUnassignedEvent>({
        type: 'MilestoneUnassignedEvent',
        milestoneId: milestoneAssigned.milestoneId
      });

      const issue = {
        ...emptyIssue,
        events: [milestoneAssigned]
      };
      handleFor(issue, milestoneUnassigned);
      expect(issue.csm.milestones).not.toEqual(expect.arrayContaining([milestoneAssigned.milestoneId]));

    })

    it ("should apply MilestoneUnassignedEvent for after reassign", () => {
      const milestoneAssigned = createEvent<MilestoneAssignedEvent>({
        type: 'MilestoneAssignedEvent',
        milestoneId: new ObjectId()
      });
      const milestoneUnassigned = createEvent<MilestoneUnassignedEvent>({
        type: 'MilestoneUnassignedEvent',
        milestoneId: milestoneAssigned.milestoneId
      });

      const issue = {
        ...emptyIssue,
        events: [milestoneAssigned, milestoneUnassigned, milestoneAssigned]
      };
      handleFor(issue, milestoneUnassigned);
      expect(issue.csm.milestones).not.toEqual(expect.arrayContaining([milestoneAssigned.milestoneId]));
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

    it ("should create comment ", () => {
      const issueCreated = createEvent<IssueCreatedEvent>({
        type: 'IssueCreatedEvent',
        title: 'Issue Created'
      });
      const commentCreated = createEvent<CommentCreatedEvent>({
        type: 'CommentCreatedEvent',
        text: 'test'
      });

      const issue = {
        ...emptyIssue,
        events: [issueCreated]
      };
      handleFor(issue, commentCreated);

      expect(issue.csm.comments.length).toBeTruthy();
    })

    it ("should throw Comment cannot be updated error because comment is not created", () => {
      const issueCreated = createEvent<IssueCreatedEvent>({
        type: 'IssueCreatedEvent',
        title: 'Issue Created'
      });
      const commentUpdated = createEvent<CommentUpdatedEvent>({
        type: 'CommentUpdatedEvent',
        text: 'test'
      });

      const issue = {
        ...emptyIssue,
        events: [issueCreated]
      };
      const updateComment = () => handleFor(issue, commentUpdated);

      expect(updateComment).toThrowError("Comment cannot be updated.");
    })

    it ("should throw Comment cannot be updated error because comment is hidden", () => {
      const issueCreated = createEvent<IssueCreatedEvent>({
        type: 'IssueCreatedEvent',
        title: 'Issue Created'
      });
      const commentCreated = createEvent<CommentCreatedEvent>({
        type: 'CommentCreatedEvent',
        text: 'test'
      });
      
      const issue = {
        ...emptyIssue,
        events: [issueCreated]
      };
      handleFor(issue, commentCreated);

      const commentId = issue.csm.comments[0]._id;
      const commentHidden = createEvent<CommentHiddenEvent>({
        type: 'CommentHiddenEvent',
        commentId
      });
      handleFor(issue, commentHidden);

      const commentUpdated = createEvent<CommentUpdatedEvent>({
        type: 'CommentUpdatedEvent',
        text: 'testUpdated',
        commentId 
      });
      const updateComment = () => handleFor(issue, commentUpdated);

      expect(updateComment).toThrowError("Comment cannot be updated.");
    })

    it ("should throw Comment cannot be updated error because comment is deleted", () => {
      const issueCreated = createEvent<IssueCreatedEvent>({
        type: 'IssueCreatedEvent',
        title: 'Issue Created'
      });
      const commentCreated = createEvent<CommentCreatedEvent>({
        type: 'CommentCreatedEvent',
        text: 'test'
      });
      
      const issue = {
        ...emptyIssue,
        events: [issueCreated]
      };
      handleFor(issue, commentCreated);

      const commentId = issue.csm.comments[0]._id;
      const commentDeleted = createEvent<CommentDeletedEvent>({
        type: 'CommentDeletedEvent',
        commentId
      });
      handleFor(issue, commentDeleted);

      const commentUpdated = createEvent<CommentUpdatedEvent>({
        type: 'CommentUpdatedEvent',
        text: 'testUpdated',
        commentId 
      });
      const updateComment = () => handleFor(issue, commentUpdated);

      expect(updateComment).toThrowError("Comment cannot be updated.");
    })

    it ("should update comment", () => {
      const issueCreated = createEvent<IssueCreatedEvent>({
        type: 'IssueCreatedEvent',
        title: 'Issue Created'
      });
      const commentCreated = createEvent<CommentCreatedEvent>({
        type: 'CommentCreatedEvent',
        text: 'test'
      });
      
      const issue = {
        ...emptyIssue,
        events: [issueCreated]
      };
      handleFor(issue, commentCreated);

      const commentId = issue.csm.comments[0]._id;
      const commentUpdated = createEvent<CommentUpdatedEvent>({
        type: 'CommentUpdatedEvent',
        text: 'testUpdated',
        commentId 
      });
      handleFor(issue, commentUpdated);

      expect(issue.csm.comments[0].text).toBe("testUpdated");
    })

    it ("should throw Comment cannot be hidden error because comment is not created", () => {
      const issueCreated = createEvent<IssueCreatedEvent>({
        type: 'IssueCreatedEvent',
        title: 'Issue Created'
      });

      const issue = {
        ...emptyIssue,
        events: [issueCreated]
      };

      const commentHidden = createEvent<CommentHiddenEvent>({
        type: 'CommentHiddenEvent',
        commentId: null
      });
      const hideComment = () => handleFor(issue, commentHidden);

      expect(hideComment).toThrowError("Comment cannot be hidden.");
    })

    it ("should throw Comment cannot be hidden error because comment is hidden", () => {
      const issueCreated = createEvent<IssueCreatedEvent>({
        type: 'IssueCreatedEvent',
        title: 'Issue Created'
      });
      const commentCreated = createEvent<CommentCreatedEvent>({
        type: 'CommentCreatedEvent',
        text: 'test'
      });
      
      const issue = {
        ...emptyIssue,
        events: [issueCreated]
      };
      handleFor(issue, commentCreated);

      const commentId = issue.csm.comments[0]._id;
      const commentHidden = createEvent<CommentHiddenEvent>({
        type: 'CommentHiddenEvent',
        commentId
      });
      handleFor(issue, commentHidden);
      const hideComment = () => handleFor(issue, commentHidden);

      expect(hideComment).toThrowError("Comment cannot be hidden.");
    })

    it ("should throw Comment cannot be hidden error because comment is deleted", () => {
      const issueCreated = createEvent<IssueCreatedEvent>({
        type: 'IssueCreatedEvent',
        title: 'Issue Created'
      });
      const commentCreated = createEvent<CommentCreatedEvent>({
        type: 'CommentCreatedEvent',
        text: 'test'
      });
      
      const issue = {
        ...emptyIssue,
        events: [issueCreated]
      };
      handleFor(issue, commentCreated);

      const commentId = issue.csm.comments[0]._id;
      const commentDeleted = createEvent<CommentDeletedEvent>({
        type: 'CommentDeletedEvent',
        commentId
      });
      handleFor(issue, commentDeleted);

      const commentHidden = createEvent<CommentHiddenEvent>({
        type: 'CommentHiddenEvent',
        commentId 
      });
      const hideComment = () => handleFor(issue, commentHidden);

      expect(hideComment).toThrowError("Comment cannot be hidden.");
    })

    it ("should hide comment", () => {
      const issueCreated = createEvent<IssueCreatedEvent>({
        type: 'IssueCreatedEvent',
        title: 'Issue Created'
      });
      const commentCreated = createEvent<CommentCreatedEvent>({
        type: 'CommentCreatedEvent',
        text: 'test'
      });
      
      const issue = {
        ...emptyIssue,
        events: [issueCreated]
      };
      handleFor(issue, commentCreated);

      const commentId = issue.csm.comments[0]._id;
      const commentHidden = createEvent<CommentHiddenEvent>({
        type: 'CommentHiddenEvent',
        commentId 
      });
      handleFor(issue, commentHidden);

      expect(issue.csm.comments[0].state).toBe(CommentState.Hidden);
    })
    it ("should throw Comment cannot be deleted error because comment is not created", () => {
      const issueCreated = createEvent<IssueCreatedEvent>({
        type: 'IssueCreatedEvent',
        title: 'Issue Created'
      });

      const issue = {
        ...emptyIssue,
        events: [issueCreated]
      };

      const commentDeleted = createEvent<CommentDeletedEvent>({
        type: 'CommentDeletedEvent',
        commentId: null
      });
      const deleteComment = () => handleFor(issue, commentDeleted);

      expect(deleteComment).toThrowError("Comment cannot be deleted.");
    })

    it ("should throw Comment cannot be deleted error because comment is hidden", () => {
      const issueCreated = createEvent<IssueCreatedEvent>({
        type: 'IssueCreatedEvent',
        title: 'Issue Created'
      });
      const commentCreated = createEvent<CommentCreatedEvent>({
        type: 'CommentCreatedEvent',
        text: 'test'
      });
      
      const issue = {
        ...emptyIssue,
        events: [issueCreated]
      };
      handleFor(issue, commentCreated);

      const commentId = issue.csm.comments[0]._id;
      const commentDeleted = createEvent<CommentDeletedEvent>({
        type: 'CommentDeletedEvent',
        commentId
      });
      handleFor(issue, commentDeleted);
      const deleteComment = () => handleFor(issue, commentDeleted);

      expect(deleteComment).toThrowError("Comment cannot be deleted.");
    })

    it ("should throw Comment cannot be deleted error because comment is deleted", () => {
      const issueCreated = createEvent<IssueCreatedEvent>({
        type: 'IssueCreatedEvent',
        title: 'Issue Created'
      });
      const commentCreated = createEvent<CommentCreatedEvent>({
        type: 'CommentCreatedEvent',
        text: 'test'
      });
      
      const issue = {
        ...emptyIssue,
        events: [issueCreated]
      };
      handleFor(issue, commentCreated);

      const commentId = issue.csm.comments[0]._id;
      const commentDeleted = createEvent<CommentDeletedEvent>({
        type: 'CommentDeletedEvent',
        commentId
      });
      handleFor(issue, commentDeleted);

      const deleteComment = () => handleFor(issue, commentDeleted);

      expect(deleteComment).toThrowError("Comment cannot be deleted.");
    })

    it ("should delete comment", () => {
      const issueCreated = createEvent<IssueCreatedEvent>({
        type: 'IssueCreatedEvent',
        title: 'Issue Created'
      });
      const commentCreated = createEvent<CommentCreatedEvent>({
        type: 'CommentCreatedEvent',
        text: 'test'
      });
      
      const issue = {
        ...emptyIssue,
        events: [issueCreated]
      };
      handleFor(issue, commentCreated);

      const commentId = issue.csm.comments[0]._id;
      const commentDeleted = createEvent<CommentDeletedEvent>({
        type: 'CommentDeletedEvent',
        commentId 
      });
      handleFor(issue, commentDeleted);

      expect(issue.csm.comments[0].state).toBe(CommentState.Deleted);
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