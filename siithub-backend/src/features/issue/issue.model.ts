import { ObjectId } from "mongodb";
import { type BaseEvent, type AggregateRoot } from "../../db/base.repo.utils";
import { BadLogicException } from "../../error-handling/errors";
import { type Label } from "../label/label.model";
import { type Milestone } from "../milestone/milestone.model";
import { type Repository } from "../repository/repository.model";
import { type User } from "../user/user.model";
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
import { type Comment } from "../common/events/events.model";

import { findLastEvent } from "../common/events/utils";

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

export function handleAllFor(issue: Issue, events: BaseEvent[]) {
  events.forEach((e) => handleFor(issue, e));
}

function issueCreatedEventHadler(issue: Issue, event: BaseEvent) {
  const issueCreated = event as IssueCreatedEvent;
  issue.csm = {
    timeStamp: event.timeStamp,
    lastModified: event.timeStamp,
    author: new ObjectId(event.by.toString()),
    title: issueCreated.title,
    description: issueCreated.description,
    state: IssueState.Open,
    labels: [],
    milestones: [],
    assignees: [],
    comments: [],
  };
}

function issueUpdatedEventHadler(issue: Issue, event: BaseEvent) {
  const issueUpdated = event as IssueUpdatedEvent;
  issue.csm.lastModified = event.timeStamp;
  issue.csm.title = issueUpdated.title;
  issue.csm.description = issueUpdated.description;
}

function issueReopenedEventHadler(issue: Issue, event: BaseEvent) {
  const lastIssueStateEvent = findLastEvent<IssueCreatedEvent | IssueReopenedEvent | IssueClosedEvent>(
    issue.events,
    (e) => ["IssueCreatedEvent", "IssueReopenedEvent", "IssueClosedEvent"].includes(e.type)
  );
  if (!lastIssueStateEvent || ["IssueCreatedEvent", "IssueReopenedEvent"].includes(lastIssueStateEvent?.type ?? "")) {
    throw new BadLogicException("Issue cannot be reopened.", event);
  }

  issue.csm.state = IssueState.Reopened;
}

function issueClosedEventHadler(issue: Issue, event: BaseEvent) {
  const lastIssueStateEvent = findLastEvent<IssueCreatedEvent | IssueReopenedEvent | IssueClosedEvent>(
    issue.events,
    (e) => ["IssueCreatedEvent", "IssueReopenedEvent", "IssueClosedEvent"].includes(e.type)
  );
  if (!lastIssueStateEvent || lastIssueStateEvent?.type === "IssueClosedEvent") {
    throw new BadLogicException("Issue cannot be closed.", event);
  }

  issue.csm.state = IssueState.Closed;
}

export function handleFor(issue: Issue, event: BaseEvent) {
  const eventHandlers: any = {
    IssueCreatedEvent: issueCreatedEventHadler,
    IssueUpdatedEvent: issueUpdatedEventHadler,
    LabelAssignedEvent: labelAssignedEventHandler,
    LabelUnassignedEvent: labelUnassignedEventHandler,
    MilestoneAssignedEvent: milestoneAssignedEventHandler,
    MilestoneUnassignedEvent: milestoneUnassignedEventHandler,
    UserAssignedEvent: userAssignedEventHandler,
    UserUnassignedEvent: userUnassignedEventHandler,
    IssueReopenedEvent: issueReopenedEventHadler,
    IssueClosedEvent: issueClosedEventHadler,
    CommentCreatedEvent: commentCreatedEventHandler,
    CommentUpdatedEvent: commentUpdatedEventHandler,
    CommentHiddenEvent: commentHiddenEventHandler,
    CommentDeletedEvent: commentDeletedEventHandler,
    UserReactedEvent: userReactedEventHandler,
    UserUnreactedEvent: userUnreactedEventHandler,
    Default: nonExistingEventHandler,
  };

  const eventHandler = eventHandlers[event?.type] || eventHandlers.Default;

  eventHandler(issue, event);

  issue.events.push(event);
}

function nonExistingEventHandler(_: Issue, event: BaseEvent) {
  throw new BadLogicException("Invalid event type for Issue.", event);
}
