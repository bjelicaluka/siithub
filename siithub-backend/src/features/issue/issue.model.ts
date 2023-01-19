import { ObjectId } from "mongodb";
import { type BaseEvent, type BaseEntity, type AggregateRoot } from "../../db/base.repo.utils";
import { BadLogicException } from "../../error-handling/errors";
import { type Label } from "../label/label.model";
import { type Milestone } from "../milestone/milestone.model";
import { type Repository } from "../repository/repository.model";
import { type User } from "../user/user.model";
import {
  labelAssignedEventHandler,
  labelUnassignedEventHandler,
  milestoneAssignedEventHandler,
  milestoneUnassignedEventHandler,
  userAssignedEventHandler,
  userUnassignedEventHandler,
} from "../common/events/events.handlers";
import { compareIds, findLastEvent } from "../common/events/utils";

export enum CommentState {
  Existing,
  Hidden,
  Deleted,
}

type Reactions = {
  [code: string]: number;
};

export type Comment = BaseEntity & {
  text: string;
  state: CommentState;
  reactions: Reactions;
};

export enum IssueState {
  Open,
  Closed,
  Reopened,
}

export type IssueCSM = {
  timeStamp?: Date;
  lastModified?: Date;
  author?: User["_id"];
  state?: IssueState;
  title?: string;
  description?: string;
  labels?: Label["_id"][];
  milestones?: Milestone["_id"][];
  assignees?: User["_id"][];
  comments?: Comment[];
};

export type Issue = AggregateRoot<IssueCSM> & {
  localId: number;
  repositoryId: Repository["_id"];
};

export type IssueWithParticipants = Issue & {
  participants: { [uid: string]: any };
};

export type IssueCreate = Omit<Issue, "_id" | "cms" | "localId">;
export type IssueUpdate = Omit<Issue, "cms">;

export type IssueCreatedEvent = BaseEvent & {
  title: string;
  description: string;
};
export type IssueUpdatedEvent = BaseEvent & {
  title: string;
  description: string;
};

export type IssueReopenedEvent = BaseEvent & {};
export type IssueClosedEvent = BaseEvent & {};

export type CommentCreatedEvent = BaseEvent & {
  commentId: Comment["_id"];
  text: string;
};
export type CommentUpdatedEvent = BaseEvent & {
  commentId: Comment["_id"];
  text: string;
};
export type CommentHiddenEvent = BaseEvent & { commentId: Comment["_id"] };
export type CommentDeletedEvent = BaseEvent & { commentId: Comment["_id"] };

export type UserReactedEvent = BaseEvent & {
  code: string;
  commentId: Comment["_id"];
};
export type UserUnreactedEvent = BaseEvent & {
  code: string;
  commentId: Comment["_id"];
};

export function handleAllFor(issue: Issue, events: BaseEvent[]) {
  events.forEach((e) => handleFor(issue, e));
}

export function handleFor(issue: Issue, event: BaseEvent) {
  switch (event?.type) {
    case "IssueCreatedEvent": {
      const issueCreated = event as IssueCreatedEvent;
      issue.csm = {
        timeStamp: event.timeStamp,
        author: new ObjectId(event.by.toString()),
        title: issueCreated.title,
        description: issueCreated.description,
        state: IssueState.Open,
        labels: [],
        milestones: [],
        assignees: [],
        comments: [],
      };
      break;
    }
    case "IssueUpdatedEvent": {
      const issueUpdated = event as IssueUpdatedEvent;
      issue.csm.lastModified = event.timeStamp;
      issue.csm.title = issueUpdated.title;
      issue.csm.description = issueUpdated.description;
      break;
    }
    case "LabelAssignedEvent": {
      labelAssignedEventHandler(issue, event);
      break;
    }
    case "LabelUnassignedEvent": {
      labelUnassignedEventHandler(issue, event);
      break;
    }
    case "MilestoneAssignedEvent": {
      milestoneAssignedEventHandler(issue, event);
      break;
    }
    case "MilestoneUnassignedEvent": {
      milestoneUnassignedEventHandler(issue, event);
      break;
    }
    case "UserAssignedEvent": {
      userAssignedEventHandler(issue, event);
      break;
    }
    case "UserUnassignedEvent": {
      userUnassignedEventHandler(issue, event);
      break;
    }
    case "IssueReopenedEvent": {
      const lastIssueStateEvent = findLastEvent<IssueCreatedEvent | IssueReopenedEvent | IssueClosedEvent>(
        issue.events,
        (e) => ["IssueCreatedEvent", "IssueReopenedEvent", "IssueClosedEvent"].includes(e.type)
      );
      if (
        !lastIssueStateEvent ||
        ["IssueCreatedEvent", "IssueReopenedEvent"].includes(lastIssueStateEvent?.type ?? "")
      ) {
        throw new BadLogicException("Issue cannot be reopened.", event);
      }

      issue.csm.state = IssueState.Reopened;
      break;
    }
    case "IssueClosedEvent": {
      const lastIssueStateEvent = findLastEvent<IssueCreatedEvent | IssueReopenedEvent | IssueClosedEvent>(
        issue.events,
        (e) => ["IssueCreatedEvent", "IssueReopenedEvent", "IssueClosedEvent"].includes(e.type)
      );
      if (!lastIssueStateEvent || lastIssueStateEvent?.type === "IssueClosedEvent") {
        throw new BadLogicException("Issue cannot be closed.", event);
      }

      issue.csm.state = IssueState.Closed;
      break;
    }
    case "CommentCreatedEvent": {
      const commentCreated = event as CommentCreatedEvent;
      commentCreated.commentId = new ObjectId();

      issue.csm.comments?.push({
        _id: commentCreated.commentId,
        text: commentCreated.text,
        state: CommentState.Existing,
        reactions: {},
      });
      break;
    }
    case "CommentUpdatedEvent": {
      const commentUpdated = event as CommentUpdatedEvent;

      if (!canCommentBeModified(issue, commentUpdated.commentId)) {
        throw new BadLogicException("Comment cannot be updated.", event);
      }

      const commentToBeUpdated = findComment(issue, commentUpdated.commentId);
      commentToBeUpdated.text = commentUpdated.text;
      break;
    }
    case "CommentHiddenEvent": {
      const commentHidden = event as CommentHiddenEvent;

      if (!canCommentBeModified(issue, commentHidden.commentId)) {
        throw new BadLogicException("Comment cannot be hidden.", event);
      }

      const commentToBeHidden = findComment(issue, commentHidden.commentId);
      commentToBeHidden.state = CommentState.Hidden;
      break;
    }
    case "CommentDeletedEvent": {
      const commentDeleted = event as CommentDeletedEvent;
      if (!canCommentBeModified(issue, commentDeleted.commentId)) {
        throw new BadLogicException("Comment cannot be deleted.", event);
      }

      const commentToBeDeleted = findComment(issue, commentDeleted.commentId);
      commentToBeDeleted.state = CommentState.Deleted;
      break;
    }
    case "UserReactedEvent": {
      const userReacted = event as UserReactedEvent;
      const lastReactionEvent = findLastEvent<UserReactedEvent | UserUnreactedEvent>(
        issue.events,
        (e) =>
          compareIds(e?.commentId, userReacted?.commentId) &&
          compareIds(e?.by, userReacted?.by) &&
          e?.code === userReacted?.code
      );

      if (lastReactionEvent?.type === "UserReactedEvent") {
        throw new BadLogicException("Reaction cannot be added.", event);
      }

      const comment = findComment(issue, userReacted.commentId);
      if (!comment || comment.state !== CommentState.Existing) {
        throw new BadLogicException("Reaction cannot be added because comment does not exist.", event);
      }

      comment.reactions[userReacted.code] = comment.reactions[userReacted.code] + 1 || 1;
      break;
    }
    case "UserUnreactedEvent": {
      const userUnreacted = event as UserUnreactedEvent;
      const lastReactionEvent = findLastEvent<UserReactedEvent | UserUnreactedEvent>(
        issue.events,
        (e) =>
          compareIds(e?.commentId, userUnreacted?.commentId) &&
          compareIds(e?.by, userUnreacted?.by) &&
          e?.code === userUnreacted?.code
      );

      if (!lastReactionEvent || lastReactionEvent?.type === "UserUnreactedEvent") {
        throw new BadLogicException("Reaction cannot be removed.", event);
      }

      const comment = findComment(issue, userUnreacted.commentId);
      if (comment.state !== CommentState.Existing) {
        throw new BadLogicException("Reaction cannot be added because comment does not exist.");
      }

      comment.reactions[userUnreacted.code] = comment.reactions[userUnreacted.code] - 1;

      if (comment.reactions[userUnreacted.code] === 0) {
        delete comment.reactions[userUnreacted.code];
      }
      break;
    }
    default:
      throw new BadLogicException("Invalid event type for Issue.", event);
  }

  issue.events.push(event);
}

function canCommentBeModified(issue: Issue, commentId: Comment["_id"]): boolean {
  const lastCommentEvent = findLastEvent<CommentCreatedEvent | CommentHiddenEvent | CommentDeletedEvent>(
    issue.events,
    (e) =>
      ["CommentCreatedEvent", "CommentHiddenEvent", "CommentDeletedEvent"].includes(e.type) &&
      compareIds(e.commentId, commentId)
  );

  return !(
    !lastCommentEvent ||
    lastCommentEvent?.type === "CommentHiddenEvent" ||
    lastCommentEvent?.type === "CommentDeletedEvent"
  );
}

function findComment(issue: Issue, commentId: Comment["_id"]): Comment {
  return issue.csm.comments?.find((c) => c._id === commentId || c._id?.toString() === commentId?.toString()) as Comment;
}
