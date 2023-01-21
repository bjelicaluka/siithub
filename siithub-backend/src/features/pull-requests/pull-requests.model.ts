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

export type PullRequestCSM = {
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

    Default: nonExistingEventHandler,
  };

  const eventHandler = eventHandlers[event?.type] || eventHandlers.Default;

  eventHandler(pullRequest, event);

  pullRequest.events.push(event);
}

function pullRequestCreatedEventHandler(pullRequest: PullRequest, event: BaseEvent) {
  const prCreatedEvent = event as PullRequestCreatedEvent;
  pullRequest.csm = {
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

function findConversation(pullRequest: PullRequest, conversationId: PullRequestConversation["_id"]) {
  return pullRequest.csm.conversations?.find((conversation) =>
    compareIds(conversation._id, conversationId)
  ) as PullRequestConversation;
}

function nonExistingEventHandler(_: PullRequest, event: BaseEvent) {
  throw new BadLogicException("Invalid event type for Pull Request.", event);
}
