import type { AggregateRoot, BaseEvent } from "../../../db/base.repo.utils";
import type { Label } from "../../label/label.model";
import type { Milestone } from "../../milestone/milestone.model";
import type { User } from "../../user/user.model";
import type {
  Comment,
  CommentCreatedEvent,
  CommentDeletedEvent,
  CommentHiddenEvent,
  CommentUpdatedEvent,
  LabelAssignedEvent,
  LabelUnassignedEvent,
  MilestoneAssignedEvent,
  MilestoneUnassignedEvent,
  UserAssignedEvent,
  UserReactedEvent,
  UserUnassignedEvent,
  UserUnreactedEvent,
} from "./events.model";
import { CommentState } from "./events.model";
import { BadLogicException } from "../../../error-handling/errors";
import { canCommentBeModified, compareIds, findComment, findLastEvent } from "./utils";
import { ObjectId } from "mongodb";

type Lableable = AggregateRoot<{ labels?: Label["_id"][] }>;

function labelAssignedEventHandler({ csm, events }: Lableable, event: BaseEvent) {
  const labelAssigned = event as LabelAssignedEvent;
  const lastLabelEvent = findLastEvent<LabelAssignedEvent | LabelUnassignedEvent>(events, (e) =>
    compareIds(e?.labelId, labelAssigned?.labelId)
  );
  if (lastLabelEvent?.type === "LabelAssignedEvent") {
    throw new BadLogicException("Label is already assigned to the Issue.", event);
  }

  csm.labels?.push(labelAssigned?.labelId);
}

function labelUnassignedEventHandler({ csm, events }: Lableable, event: BaseEvent) {
  const labelUnassigned = event as LabelUnassignedEvent;
  const lastLabelEvent = findLastEvent<LabelAssignedEvent | LabelUnassignedEvent>(events, (e) =>
    compareIds(e?.labelId, labelUnassigned?.labelId)
  );
  if (!lastLabelEvent || lastLabelEvent?.type === "LabelUnassignedEvent") {
    throw new BadLogicException("Label cannot be unassigned from the Issue.", event);
  }

  csm.labels = csm?.labels?.filter(
    (l) => l !== labelUnassigned?.labelId && l.toString() !== labelUnassigned?.labelId?.toString()
  );
}

type Checkpointable = AggregateRoot<{ milestones?: Milestone["_id"][] }>;

function milestoneAssignedEventHandler({ csm, events }: Checkpointable, event: BaseEvent) {
  const milestoneAssigned = event as MilestoneAssignedEvent;
  const lastMilestoneEvent = findLastEvent<MilestoneAssignedEvent | MilestoneUnassignedEvent>(events, (e) =>
    compareIds(e?.milestoneId, milestoneAssigned?.milestoneId)
  );
  if (lastMilestoneEvent?.type === "MilestoneAssignedEvent") {
    throw new BadLogicException("Milestone is already assigned to the Issue.", event);
  }

  csm.milestones?.push(milestoneAssigned?.milestoneId);
}

function milestoneUnassignedEventHandler({ csm, events }: Checkpointable, event: BaseEvent) {
  const milestoneUnassigned = event as MilestoneUnassignedEvent;
  const lastMilestoneEvent = findLastEvent<MilestoneAssignedEvent | MilestoneUnassignedEvent>(events, (e) =>
    compareIds(e?.milestoneId, milestoneUnassigned?.milestoneId)
  );
  if (!lastMilestoneEvent || lastMilestoneEvent?.type === "MilestoneUnassignedEvent") {
    throw new BadLogicException("Milestone cannot be unassigned from the Issue.", event);
  }

  csm.milestones = csm?.milestones?.filter(
    (m) => m !== milestoneUnassigned?.milestoneId && m.toString() !== milestoneUnassigned?.milestoneId?.toString()
  );
}

type Assignable = AggregateRoot<{ assignees?: User["_id"][] }>;

function userAssignedEventHandler({ csm, events }: Assignable, event: BaseEvent) {
  const userAssigned = event as UserAssignedEvent;
  const lastUserEvent = findLastEvent<UserAssignedEvent | UserUnassignedEvent>(events, (e) =>
    compareIds(e?.userId, userAssigned?.userId)
  );
  if (lastUserEvent?.type === "UserAssignedEvent") {
    throw new BadLogicException("User is already assigned to the Issue.", event);
  }

  csm.assignees?.push(userAssigned?.userId);
}

function userUnassignedEventHandler({ csm, events }: Assignable, event: BaseEvent) {
  const userUnassigned = event as UserUnassignedEvent;
  const lastUserEvent = findLastEvent<UserAssignedEvent | UserUnassignedEvent>(events, (e) =>
    compareIds(e?.userId, userUnassigned?.userId)
  );
  if (!lastUserEvent || lastUserEvent?.type === "UserUnassignedEvent") {
    throw new BadLogicException("User cannot be unassigned from the Issue.", event);
  }

  csm.assignees = csm?.assignees?.filter(
    (u) => u !== userUnassigned?.userId && u.toString() !== userUnassigned?.userId?.toString()
  );
}

type Commentable = AggregateRoot<{ comments?: Comment[] }>;

function commentCreatedEventHandler({ csm, events }: Commentable, event: BaseEvent) {
  const commentCreated = event as CommentCreatedEvent;
  commentCreated.commentId = new ObjectId();

  csm.comments?.push({
    _id: commentCreated.commentId,
    text: commentCreated.text,
    state: CommentState.Existing,
    reactions: {},
  });
}

function commentUpdatedEventHandler({ csm, events }: Commentable, event: BaseEvent) {
  const commentUpdated = event as CommentUpdatedEvent;

  if (!canCommentBeModified({ events }, commentUpdated.commentId)) {
    throw new BadLogicException("Comment cannot be updated.", event);
  }

  const commentToBeUpdated = findComment({ csm }, commentUpdated.commentId);
  commentToBeUpdated.text = commentUpdated.text;
}

function commentHiddenEventHandler({ csm, events }: Commentable, event: BaseEvent) {
  const commentHidden = event as CommentHiddenEvent;

  if (!canCommentBeModified({ events }, commentHidden.commentId)) {
    throw new BadLogicException("Comment cannot be hidden.", event);
  }

  const commentToBeHidden = findComment({ csm }, commentHidden.commentId);
  commentToBeHidden.state = CommentState.Hidden;
}

function commentDeletedEventHandler({ csm, events }: Commentable, event: BaseEvent) {
  const commentDeleted = event as CommentDeletedEvent;
  if (!canCommentBeModified({ events }, commentDeleted.commentId)) {
    throw new BadLogicException("Comment cannot be deleted.", event);
  }

  const commentToBeDeleted = findComment({ csm }, commentDeleted.commentId);
  commentToBeDeleted.state = CommentState.Deleted;
}

type Reactable = AggregateRoot<{ comments?: { reactions: any }[] }>;

function userReactedEventHandler({ csm, events }: Reactable, event: BaseEvent) {
  const userReacted = event as UserReactedEvent;
  const lastReactionEvent = findLastEvent<UserReactedEvent | UserUnreactedEvent>(
    events,
    (e) =>
      compareIds(e?.commentId, userReacted?.commentId) &&
      compareIds(e?.by, userReacted?.by) &&
      e?.code === userReacted?.code
  );

  if (lastReactionEvent?.type === "UserReactedEvent") {
    throw new BadLogicException("Reaction cannot be added.", event);
  }

  const comment = findComment({ csm }, userReacted.commentId);
  if (!comment || comment.state !== CommentState.Existing) {
    throw new BadLogicException("Reaction cannot be added because comment does not exist.", event);
  }

  comment.reactions[userReacted.code] = comment.reactions[userReacted.code] + 1 || 1;
}

function userUnreactedEventHandler({ csm, events }: Reactable, event: BaseEvent) {
  const userUnreacted = event as UserUnreactedEvent;
  const lastReactionEvent = findLastEvent<UserReactedEvent | UserUnreactedEvent>(
    events,
    (e) =>
      compareIds(e?.commentId, userUnreacted?.commentId) &&
      compareIds(e?.by, userUnreacted?.by) &&
      e?.code === userUnreacted?.code
  );

  if (!lastReactionEvent || lastReactionEvent?.type === "UserUnreactedEvent") {
    throw new BadLogicException("Reaction cannot be removed.", event);
  }

  const comment = findComment({ csm }, userUnreacted.commentId);
  if (comment.state !== CommentState.Existing) {
    throw new BadLogicException("Reaction cannot be added because comment does not exist.");
  }

  comment.reactions[userUnreacted.code] = comment.reactions[userUnreacted.code] - 1;

  if (comment.reactions[userUnreacted.code] === 0) {
    delete comment.reactions[userUnreacted.code];
  }
}

export {
  labelAssignedEventHandler,
  labelUnassignedEventHandler,
  milestoneAssignedEventHandler,
  milestoneUnassignedEventHandler,
  userAssignedEventHandler,
  userUnassignedEventHandler,
  commentCreatedEventHandler,
  commentUpdatedEventHandler,
  commentHiddenEventHandler,
  commentDeletedEventHandler,
  userReactedEventHandler,
  userUnreactedEventHandler,
};
