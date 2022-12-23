import { type BaseEvent, type AggregateRoot } from "../../db/base.repo.utils";
import { BadLogicException } from "../../error-handling/errors";
import { type Label } from "../label/label.model";
import { type Repository } from "../repository/repository.model";
import { type User } from "../user/user.model";

export enum IssueState {
  Open,
  Closed,
  Reopened
}

export type IssueCSM = {
  timeStamp?: Date,
  lastModified?: Date,
  state?: IssueState,
  title?: string,
  description?: string,
  labels?: Label['_id'][],
  assignees?: User['_id'][],
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

export type UserAssignedEvent = BaseEvent & { userId: User['_id'] };
export type UserUnassignedEvent = BaseEvent & { userId: User['_id'] };

export type IssueReopenedEvent = BaseEvent & {};
export type IssueClosedEvent = BaseEvent & {};

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
        assignees: []
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