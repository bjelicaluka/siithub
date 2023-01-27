import type { AggregateRoot, BaseEntity, BaseEvent } from "../../db/base.repo.utils";
import type { Repository } from "../repository/repository.model";
import {
  commentCreatedEventHandler,
  commentDeletedEventHandler,
  commentHiddenEventHandler,
  commentUpdatedEventHandler,
  labelAssignedEventHandler,
  labelUnassignedEventHandler,
  milestoneAssignedEventHandler,
  milestoneUnassignedEventHandler,
  userAssignedEventHandler,
  userReactedEventHandler,
  userUnassignedEventHandler,
  userUnreactedEventHandler,
} from "../common/events/events.handlers";
import { type Label } from "../label/label.model";
import { type Milestone } from "../milestone/milestone.model";
import { type User } from "../user/user.model";
import { BadLogicException } from "../../error-handling/errors";
import type {
  Comment,
  CommentCreatedEvent,
  CommentDeletedEvent,
  CommentHiddenEvent,
  CommentUpdatedEvent,
} from "../common/events/events.model";
import { ObjectId } from "mongodb";
import { compareIds, findLastEvent } from "../common/events/utils";

export type PossiblyInConversation<T = {}> = T & {
  conversation?: string;
};

type PullRequestComment = PossiblyInConversation<Comment>;

type PullRequestConversation = BaseEntity & {
  isResolved: boolean;
  topic: string;
  changes: any;
  comments?: PullRequestComment[];
};

export enum PullRequestState {
  Opened,
  ChangesRequired,
  Approved,
  Canceled,
  Merged,
}

export type PullRequestCSM = {
  timeStamp?: Date;
  lastModified?: Date;
  author?: User["_id"];
  isClosed: boolean;
  state: PullRequestState;
  base: string;
  compare: string;
  title: string;
  labels?: Label["_id"][];
  milestones?: Milestone["_id"][];
  assignees?: User["_id"][];
  comments?: PullRequestComment[];
  conversations?: PullRequestConversation[];
};

export type PullRequest = AggregateRoot<PullRequestCSM> & {
  localId: number;
  repositoryId: Repository["_id"];
};

export type PullRequestWithParticipants = PullRequest & {
  participants: { [uid: string]: any };
};

export type PullRequestCreate = Omit<PullRequest, "_id" | "cms" | "localId">;
export type PullRequestUpdate = Omit<PullRequest, "cms">;

export type PullRequestCreatedEvent = BaseEvent & {
  base: string;
  compare: string;
  title: string;
  comment: string;
};

export type PullRequestUpdatedEvent = Omit<PullRequestCreatedEvent, "comment">;

export type PullRequestCommentCreatedEvent = PossiblyInConversation<CommentCreatedEvent>;
export type PullRequestCommentUpdatedEvent = PossiblyInConversation<CommentUpdatedEvent>;
export type PullRequestCommentHiddenEvent = PossiblyInConversation<CommentHiddenEvent>;
export type PullRequestCommentDeletedEvent = PossiblyInConversation<CommentDeletedEvent>;

export type PullRequestConversationCreatedEvent = BaseEvent & {
  conversationId: PullRequestConversation["_id"];
  topic: string;
  changes: any;
};

export type PullRequestConversationResolvedEvent = BaseEvent & {
  conversationId: PullRequestConversation["_id"];
};

export type PullRequestConversationUnresolvedEvent = BaseEvent & {
  conversationId: PullRequestConversation["_id"];
};

export type PullRequestMergedEvent = BaseEvent & {};
export type PullRequestCanceledEvent = BaseEvent & {};
export type PullRequestApprovedEvent = BaseEvent & {};
export type PullRequestChangesRequiredEvent = BaseEvent & {};

export function handleAllFor(pullRequest: PullRequest, events: BaseEvent[]) {
  events.forEach((e) => handleFor(pullRequest, e));
}

export function pullRequestCommentCreatedEventHandlerWrapper(eventHandler: any) {
  return (pullRequest: PullRequest, event: BaseEvent) => {
    const possiblyInConversation = event as PossiblyInConversation;
    if (!possiblyInConversation.conversation) {
      eventHandler(pullRequest, event);
      return;
    }

    const conversation = pullRequest.csm.conversations?.find(
      (conversation) => conversation.topic === possiblyInConversation.conversation
    ) as PullRequestConversation;

    eventHandler({ _id: conversation._id, csm: conversation, events: pullRequest.events }, event);
  };
}

export function pullRequestCommentModifiedEventHandlerWrapper(eventHandler: any) {
  return (pullRequest: PullRequest, event: BaseEvent) => {
    const comments = getAllComments(pullRequest);
    eventHandler({ _id: pullRequest._id, csm: { comments }, events: pullRequest.events }, event);
  };
}

export function pullRequestReactionEventHandlerWrapper(eventHandler: any) {
  return (pullRequest: PullRequest, event: BaseEvent) => {
    const comments = getAllComments(pullRequest);

    eventHandler({ _id: pullRequest._id, csm: { comments }, events: pullRequest.events }, event);
  };
}

function getAllComments(pullRequest: PullRequest) {
  return [
    ...(pullRequest?.csm?.conversations?.flatMap((c) => c?.comments ?? []) ?? []),
    ...(pullRequest?.csm?.comments ?? []),
  ];
}

export function handleFor(pullRequest: PullRequest, event: BaseEvent) {
  const eventHandlers: any = {
    PullRequestCreatedEvent: pullRequestCreatedEventHandler,
    PullRequestUpdatedEvent: pullRequestUpdatedEventHandler,
    LabelAssignedEvent: labelAssignedEventHandler,
    LabelUnassignedEvent: labelUnassignedEventHandler,
    MilestoneAssignedEvent: milestoneAssignedEventHandler,
    MilestoneUnassignedEvent: milestoneUnassignedEventHandler,
    UserAssignedEvent: userAssignedEventHandler,
    UserUnassignedEvent: userUnassignedEventHandler,
    CommentCreatedEvent: pullRequestCommentCreatedEventHandlerWrapper(commentCreatedEventHandler),
    CommentUpdatedEvent: pullRequestCommentModifiedEventHandlerWrapper(commentUpdatedEventHandler),
    CommentHiddenEvent: pullRequestCommentModifiedEventHandlerWrapper(commentHiddenEventHandler),
    CommentDeletedEvent: pullRequestCommentModifiedEventHandlerWrapper(commentDeletedEventHandler),
    UserReactedEvent: pullRequestReactionEventHandlerWrapper(userReactedEventHandler),
    UserUnreactedEvent: pullRequestReactionEventHandlerWrapper(userUnreactedEventHandler),
    ConversationCreatedEvent: pullRequestConversationCreatedEventHandler,
    ConversationResolvedEvent: pullRequestConversationResolvedEventHandler,
    ConversationUnresolvedEvent: pullRequestConversationUnresolvedEventHandler,
    PullRequestApprovedEvent: pullRequestApprovedEventHandler,
    PullRequestChangesRequiredEvent: pullRequestChangesRequiredEventHandler,
    PullRequestMergedEvent: pullRequestMergedEventHandler,
    PullRequestCanceledEvent: pullRequestCanceledEventHandler,

    Default: nonExistingEventHandler,
  };

  const eventHandler = eventHandlers[event?.type] || eventHandlers.Default;

  eventHandler(pullRequest, event);

  pullRequest.events.push(event);
}

function pullRequestCreatedEventHandler(pullRequest: PullRequest, event: BaseEvent) {
  const prCreatedEvent = event as PullRequestCreatedEvent;
  pullRequest.csm = {
    timeStamp: event.timeStamp,
    lastModified: event.timeStamp,
    author: new ObjectId(prCreatedEvent.by?.toString()),
    isClosed: false,
    state: PullRequestState.Opened,
    base: prCreatedEvent.base,
    compare: prCreatedEvent.compare,
    title: prCreatedEvent.title,
    labels: [],
    milestones: [],
    assignees: [],
    comments: [],
    conversations: [],
  };
}

function pullRequestUpdatedEventHandler(pullRequest: PullRequest, event: BaseEvent) {
  const prCreatedEvent = event as PullRequestCreatedEvent;
  pullRequest.csm = {
    ...pullRequest.csm,
    lastModified: event.timeStamp,
    base: prCreatedEvent.base,
    compare: prCreatedEvent.compare,
    title: prCreatedEvent.title,
  };
}

function pullRequestConversationCreatedEventHandler(pullRequest: PullRequest, event: BaseEvent) {
  const prConversationCreatedEvent = event as PullRequestConversationCreatedEvent;
  prConversationCreatedEvent.conversationId = new ObjectId();

  pullRequest.csm.conversations?.push({
    _id: prConversationCreatedEvent.conversationId,
    isResolved: false,
    topic: prConversationCreatedEvent.topic,
    changes: prConversationCreatedEvent.changes,
    comments: [],
  });
}

function pullRequestConversationResolvedEventHandler(pullRequest: PullRequest, event: BaseEvent) {
  const prConversationResolvedEvent = event as PullRequestConversationResolvedEvent;

  const lastConversationEvent = findLastEvent<
    PullRequestConversationCreatedEvent | PullRequestConversationResolvedEvent | PullRequestConversationUnresolvedEvent
  >(pullRequest.events, (e) => compareIds(e?.conversationId, prConversationResolvedEvent?.conversationId));

  if (!lastConversationEvent || lastConversationEvent.type === "ConversationResolvedEvent") {
    throw new BadLogicException("Conversation cannot be resolved.", event);
  }

  const conversation = findConversation(pullRequest, prConversationResolvedEvent?.conversationId);
  conversation.isResolved = true;
}

function pullRequestConversationUnresolvedEventHandler(pullRequest: PullRequest, event: BaseEvent) {
  const prConversationResolvedEvent = event as PullRequestConversationResolvedEvent;

  const lastConversationEvent = findLastEvent<
    PullRequestConversationCreatedEvent | PullRequestConversationResolvedEvent | PullRequestConversationUnresolvedEvent
  >(pullRequest.events, (e) => compareIds(e?.conversationId, prConversationResolvedEvent?.conversationId));

  if (!lastConversationEvent || lastConversationEvent.type !== "ConversationResolvedEvent") {
    throw new BadLogicException("Conversation cannot be unresolved.", event);
  }

  const conversation = findConversation(pullRequest, prConversationResolvedEvent?.conversationId);
  conversation.isResolved = false;
}

function pullRequestChangesRequiredEventHandler(pullRequest: PullRequest, event: BaseEvent) {
  if (!canModifyPullRequest(pullRequest, event)) {
    throw new BadLogicException("Cannot require changes for the pull request.");
  }

  pullRequest.csm.state = PullRequestState.ChangesRequired;
}

function pullRequestApprovedEventHandler(pullRequest: PullRequest, event: BaseEvent) {
  if (!canModifyPullRequest(pullRequest, event)) {
    throw new BadLogicException("Cannot approve the pull request.");
  }

  pullRequest.csm.state = PullRequestState.Approved;
}

function pullRequestCanceledEventHandler(pullRequest: PullRequest, event: BaseEvent) {
  if (!canModifyPullRequest(pullRequest, event)) {
    throw new BadLogicException("Cannot cancel the pull request.");
  }

  pullRequest.csm.state = PullRequestState.Canceled;
  pullRequest.csm.isClosed = true;
}

function pullRequestMergedEventHandler(pullRequest: PullRequest, event: BaseEvent) {
  if (!canModifyPullRequest(pullRequest, event)) {
    throw new BadLogicException("Cannot merge the pull request.");
  }

  const lastEvent = findLastEvent<PullRequestApprovedEvent | PullRequestChangesRequiredEvent>(
    pullRequest.events,
    (e) =>
      compareIds(e.streamId, pullRequest._id) &&
      ["PullRequestApprovedEvent", "PullRequestChangesRequiredEvent"].includes(e.type)
  );
  if (lastEvent?.type === "PullRequestChangesRequiredEvent") {
    throw new BadLogicException("Cannot merge the pull request.");
  }

  pullRequest.csm.state = PullRequestState.Merged;
  pullRequest.csm.isClosed = true;
}

function canModifyPullRequest(pullRequest: PullRequest, event: BaseEvent) {
  const createdEvent = findLastEvent<PullRequestCreatedEvent>(
    pullRequest.events,
    (e) => compareIds(e.streamId, pullRequest._id) && e.type === "PullRequestCreatedEvent"
  );
  if (!createdEvent) {
    return false;
  }

  const lastClosedEvent = findLastEvent<PullRequestMergedEvent | PullRequestCanceledEvent>(
    pullRequest.events,
    (e) =>
      compareIds(e.streamId, pullRequest._id) && ["PullRequestMergedEvent", "PullRequestCanceledEvent"].includes(e.type)
  );
  if (lastClosedEvent) {
    return false;
  }

  return true;
}

function findConversation(pullRequest: PullRequest, conversationId: PullRequestConversation["_id"]) {
  return pullRequest.csm.conversations?.find((conversation) =>
    compareIds(conversation._id, conversationId)
  ) as PullRequestConversation;
}

function nonExistingEventHandler(_: PullRequest, event: BaseEvent) {
  throw new BadLogicException("Invalid event type for Pull Request.", event);
}
