import { ObjectId } from "mongodb";
import { type BaseEvent, type BaseEntity, type AggregateRoot } from "../../db/base.repo.utils";
import { BadLogicException } from "../../error-handling/errors";
import { type Label } from "../label/label.model";
import { type Milestone } from "../milestone/milestone.model";
import { type Repository } from "../repository/repository.model";
import { type User } from "../user/user.model";

export enum CommentState {
  Existing,
  Hidden,
  Deleted
};

export type Comment = BaseEntity & {
  text?: string
  state?: CommentState
};

export enum IssueState {
  Open,
  Closed,
  Reopened
};

export type IssueCSM = {
  timeStamp?: Date,
  lastModified?: Date,
  state?: IssueState,
  title?: string,
  description?: string,
  labels?: Label['_id'][],
  milestones?: Milestone['_id'][],
  assignees?: User['_id'][],
  comments?: Comment[]
};

export type Issue = AggregateRoot & { 
  csm: IssueCSM,
  repositoryId: Repository["_id"] 
};

export type IssueCreate = Omit<Issue, "_id" | "cms">;
export type IssueUpdate = Omit<Issue, "cms">;

export type IssueCreatedEvent = BaseEvent & { title: string, description: string };
export type IssueUpdatedEvent = BaseEvent & { title: string, description: string };

export type LabelAssignedEvent = BaseEvent & { labelId: Label['_id'] };
export type LabelUnassignedEvent = BaseEvent & { labelId: Label['_id'] };

export type MilestoneAssignedEvent = BaseEvent & { milestoneId: Milestone['_id'] };
export type MilestoneUnassignedEvent = BaseEvent & { milestoneId: Milestone['_id'] };

export type UserAssignedEvent = BaseEvent & { userId: User['_id'] };
export type UserUnassignedEvent = BaseEvent & { userId: User['_id'] };

export type IssueReopenedEvent = BaseEvent & {};
export type IssueClosedEvent = BaseEvent & {};

export type CommentCreatedEvent = BaseEvent & { commentId: Comment['_id'], text: string };
export type CommentUpdatedEvent = BaseEvent & { commentId: Comment['_id'], text: string };
export type CommentHiddenEvent = BaseEvent & { commentId: Comment['_id'] };
export type CommentDeletedEvent = BaseEvent & { commentId: Comment['_id'] };

export function handleAllFor(issue: Issue, events: BaseEvent[]) {
  events.forEach(e => handleFor(issue, e));
}

export function handleFor(issue: Issue, event: BaseEvent) {
  switch (event?.type) {

    case 'IssueCreatedEvent': {
      const issueCreated = event as IssueCreatedEvent;
      issue.csm = {
        timeStamp: event.timeStamp,
        title: issueCreated.title,
        description: issueCreated.description,
        state: IssueState.Open,
        labels: [],
        milestones: [],
        assignees: [],
        comments: []
      };
      break;
    }
    case 'IssueUpdatedEvent': {
      const issueUpdated = event as IssueUpdatedEvent;
      issue.csm.lastModified = event.timeStamp;
      issue.csm.title = issueUpdated.title;
      issue.csm.description = issueUpdated.description;
      break;
    }
    case 'LabelAssignedEvent': {
      const labelAssigned = event as LabelAssignedEvent;
      const lastLabelEvent = findLastEvent<LabelAssignedEvent|LabelUnassignedEvent>(
        issue.events,
        e => e?.labelId === labelAssigned?.labelId || e?.labelId?.toString() === labelAssigned?.labelId.toString()
      );
      if (lastLabelEvent?.type === 'LabelAssignedEvent') {
        throw new BadLogicException("Label is already assigned to the Issue.", event);
      }

      issue.csm.labels?.push(labelAssigned?.labelId);
      break;
    }
    case 'LabelUnassignedEvent': {
      const labelUnassigned = event as LabelUnassignedEvent;
      const lastLabelEvent = findLastEvent<LabelAssignedEvent|LabelUnassignedEvent>(
        issue.events,
        e => e?.labelId === labelUnassigned?.labelId || e?.labelId?.toString() === labelUnassigned?.labelId.toString()
      );
      if (!lastLabelEvent || lastLabelEvent?.type === 'LabelUnassignedEvent') {
        throw new BadLogicException("Label cannot be unassigned from the Issue.", event);
      }

      issue.csm.labels = issue?.csm?.labels?.filter(l => l !== labelUnassigned?.labelId && l.toString() !== labelUnassigned?.labelId?.toString());
      break;
    }
    case 'MilestoneAssignedEvent': {
      const milestoneAssigned = event as MilestoneAssignedEvent;
      const lastMilestoneEvent = findLastEvent<MilestoneAssignedEvent|MilestoneUnassignedEvent>(
        issue.events,
        e => e?.milestoneId === milestoneAssigned?.milestoneId || e?.milestoneId?.toString() === milestoneAssigned?.milestoneId.toString()
      );
      if (lastMilestoneEvent?.type === 'MilestoneAssignedEvent') {
        throw new BadLogicException("Milestone is already assigned to the Issue.", event);
      }
      issue.csm.milestones?.push(milestoneAssigned?.milestoneId);
      break;
    }
    case 'MilestoneUnassignedEvent': {
      const milestoneUnassigned = event as MilestoneUnassignedEvent;
      const lastMilestoneEvent = findLastEvent<MilestoneAssignedEvent|MilestoneUnassignedEvent>(
        issue.events,
        e => e?.milestoneId === milestoneUnassigned?.milestoneId || e?.milestoneId?.toString() === milestoneUnassigned?.milestoneId.toString()
      );
      if (!lastMilestoneEvent || lastMilestoneEvent?.type === 'MilestoneUnassignedEvent') {
        throw new BadLogicException("Milestone cannot be unassigned from the Issue.", event);
      }

      issue.csm.milestones = issue?.csm?.milestones?.filter(m => m !== milestoneUnassigned?.milestoneId && m.toString() !== milestoneUnassigned?.milestoneId?.toString());
      break;
    }
    case 'UserAssignedEvent': {
      const userAssigned = event as UserAssignedEvent;
      const lastUserEvent = findLastEvent<UserAssignedEvent|UserUnassignedEvent>(
        issue.events,
        e => e?.userId === userAssigned?.userId || e?.userId?.toString() === userAssigned?.userId?.toString()
      );
      if (lastUserEvent?.type === 'UserAssignedEvent') {
        throw new BadLogicException("User is already assigned to the Issue.", event);
      }

      issue.csm.assignees?.push(userAssigned?.userId);
      break;
    }
    case 'UserUnassignedEvent': {
      const userUnassigned = event as UserUnassignedEvent;
      const lastUserEvent = findLastEvent<UserAssignedEvent|UserUnassignedEvent>(
        issue.events,
        e => e?.userId === userUnassigned?.userId || e?.userId?.toString() === userUnassigned?.userId?.toString()
      );
      if (!lastUserEvent || lastUserEvent?.type === 'UserUnassignedEvent') {
        throw new BadLogicException("User cannot be unassigned from the Issue.", event);
      }

      issue.csm.assignees = issue?.csm?.assignees?.filter(u => u !== userUnassigned?.userId && u.toString() !== userUnassigned?.userId?.toString());
      break;
    }
    case 'IssueReopenedEvent': {
      const lastIssueStateEvent = findLastEvent<IssueCreatedEvent| IssueReopenedEvent|IssueClosedEvent>(issue.events, e => ['IssueCreatedEvent', 'IssueReopenedEvent', 'IssueClosedEvent'].includes(e.type));
      if (!lastIssueStateEvent || ['IssueCreatedEvent', 'IssueReopenedEvent'].includes(lastIssueStateEvent?.type ?? '')) {
        throw new BadLogicException("Issue cannot be reopened.", event);
      }

      issue.csm.state = IssueState.Reopened;
      break;
    }
    case 'IssueClosedEvent': {
      const lastIssueStateEvent = findLastEvent<IssueCreatedEvent|IssueReopenedEvent|IssueClosedEvent>(issue.events, e => ['IssueCreatedEvent', 'IssueReopenedEvent', 'IssueClosedEvent'].includes(e.type));
      if (!lastIssueStateEvent || lastIssueStateEvent?.type === 'IssueClosedEvent') {
        throw new BadLogicException("Issue cannot be closed.", event);
      }

      issue.csm.state = IssueState.Closed;
      break;
    }
    case 'CommentCreatedEvent': {
      const commentCreated = event as CommentCreatedEvent;
      commentCreated.commentId = new ObjectId();

      issue.csm.comments?.push({
        _id: commentCreated.commentId,
        text: commentCreated.text,
        state: CommentState.Existing
      });
      break;
    }
    case 'CommentUpdatedEvent': {
      const commentUpdated = event as CommentUpdatedEvent;

      if(!canCommentBeModified(issue, commentUpdated.commentId)){
        throw new BadLogicException("Comment cannot be updated.", event);
      }
      const commentToBeUpdated = issue.csm.comments?.find(c => 
        c._id === commentUpdated.commentId ||
        c._id?.toString() === commentUpdated.commentId?.toString()
      ) as Comment;
      commentToBeUpdated.text = commentUpdated.text;
      break;
    }
    case 'CommentHiddenEvent': {
      const commentHidden = event as CommentHiddenEvent;

      if(!canCommentBeModified(issue, commentHidden.commentId)){
        throw new BadLogicException("Comment cannot be hidden.", event);
      }

      const commentToBeHidden = issue.csm.comments?.find(c => 
        c._id === commentHidden.commentId ||
        c._id?.toString() === commentHidden.commentId?.toString()
      ) as Comment;
      commentToBeHidden.state = CommentState.Hidden;
      break;
    }
    case 'CommentDeletedEvent': {
      const commentDeleted = event as CommentDeletedEvent;
      if(!canCommentBeModified(issue, commentDeleted.commentId)){
        throw new BadLogicException("Comment cannot be deleted.", event);
      }

      const commentToBeDeleted = issue.csm.comments?.find(c =>
        c._id === commentDeleted.commentId ||
        c._id?.toString() === commentDeleted.commentId?.toString()
      ) as Comment;
      commentToBeDeleted.state = CommentState.Deleted;
      break;
    }
    default: throw new BadLogicException("Invalid event type for Issue.", event);
  }

  issue.events.push(event);
}

function findLastEvent<T>(events: BaseEvent[], f: (arg0: T) => boolean) {
  return events
    .filter(e => f(e as T))
    .sort((e1, e2) => e1.timeStamp.getTime() - e2.timeStamp.getTime())
    .pop();
}

function canCommentBeModified(issue: Issue, commentId: Comment['_id']): boolean {
  console.log(issue.events)
  const lastCommentEvent = findLastEvent<CommentCreatedEvent|CommentHiddenEvent|CommentDeletedEvent>(
    issue.events, 
    e => ['CommentCreatedEvent', 'CommentHiddenEvent', 'CommentDeletedEvent'].includes(e.type) &&
         e.commentId === commentId || e.commentId?.toString() === commentId?.toString()
  );

  return !(!lastCommentEvent || lastCommentEvent?.type === 'CommentHiddenEvent' || lastCommentEvent?.type === 'CommentDeletedEvent');
}