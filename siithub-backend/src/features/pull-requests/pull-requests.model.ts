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

export type PossiblyInConversation<T = {}> = T & {
  conversation?: string;
};

type PullRequestComment = PossiblyInConversation<Comment>;

type PullRequestConversation = BaseEntity & {
  topic: string;
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

export function handleAllFor(pullRequest: PullRequest, events: BaseEvent[]) {
  events.forEach((e) => handleFor(pullRequest, e));
}

export function pullRequestCommentEventHandlerWrapper(eventHandler: any) {
  return (pullRequest: PullRequest, event: BaseEvent) => {
    const possiblyInConversation = event as PossiblyInConversation;
    if (!possiblyInConversation.conversation) {
      eventHandler(pullRequest, event);
      return;
    }

    let conversation = pullRequest.csm.conversations?.find(
      (conversation) => conversation.topic === possiblyInConversation.conversation
    );
    if (!conversation) {
      conversation = {
        _id: new ObjectId(),
        topic: possiblyInConversation.conversation,
        comments: [],
      };

      pullRequest.csm.conversations?.push(conversation);
    }

    eventHandler({ _id: conversation._id, csm: conversation, events: pullRequest.events }, event);
  };
}

export function pullRequestReactionEventHandlerWrapper(eventHandler: any) {
  return (pullRequest: PullRequest, event: BaseEvent) => {
    const comments = [
      ...(pullRequest?.csm?.conversations?.flatMap((c) => c?.comments ?? []) ?? []),
      ...(pullRequest?.csm?.comments ?? []),
    ];

    eventHandler({ _id: pullRequest._id, csm: { comments }, events: pullRequest.events }, event);
  };
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
    CommentCreatedEvent: pullRequestCommentEventHandlerWrapper(commentCreatedEventHandler),
    CommentUpdatedEvent: pullRequestCommentEventHandlerWrapper(commentUpdatedEventHandler),
    CommentHiddenEvent: pullRequestCommentEventHandlerWrapper(commentHiddenEventHandler),
    CommentDeletedEvent: pullRequestCommentEventHandlerWrapper(commentDeletedEventHandler),
    UserReactedEvent: pullRequestReactionEventHandlerWrapper(userReactedEventHandler),
    UserUnreactedEvent: pullRequestReactionEventHandlerWrapper(userUnreactedEventHandler),
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

function nonExistingEventHandler(_: PullRequest, event: BaseEvent) {
  throw new BadLogicException("Invalid event type for Pull Request.", event);
}
