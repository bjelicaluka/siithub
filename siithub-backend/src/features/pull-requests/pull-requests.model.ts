import type { AggregateRoot, BaseEvent } from "../../db/base.repo.utils";
import type { Repository } from "../repository/repository.model";
import {
  labelAssignedEventHandler,
  labelUnassignedEventHandler,
  milestoneAssignedEventHandler,
  milestoneUnassignedEventHandler,
  userAssignedEventHandler,
  userUnassignedEventHandler,
} from "../common/events/events.handlers";
import { type Label } from "../label/label.model";
import { type Milestone } from "../milestone/milestone.model";
import { type User } from "../user/user.model";
import { BadLogicException } from "../../error-handling/errors";

export type PullRequestCSM = {
  base: string;
  compare: string;
  title: string;
  labels?: Label["_id"][];
  milestones?: Milestone["_id"][];
  assignees?: User["_id"][];
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

export function handleAllFor(pullRequest: PullRequest, events: BaseEvent[]) {
  events.forEach((e) => handleFor(pullRequest, e));
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
