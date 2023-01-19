import type { AggregateRoot, BaseEvent } from "../../../db/base.repo.utils";
import type { Label } from "../../label/label.model";
import type { Milestone } from "../../milestone/milestone.model";
import type { User } from "../../user/user.model";
import type {
  LabelAssignedEvent,
  LabelUnassignedEvent,
  MilestoneAssignedEvent,
  MilestoneUnassignedEvent,
  UserAssignedEvent,
  UserUnassignedEvent,
} from "./events.model";
import { BadLogicException } from "../../../error-handling/errors";
import { compareIds, findLastEvent } from "./utils";

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

export {
  labelAssignedEventHandler,
  labelUnassignedEventHandler,
  milestoneAssignedEventHandler,
  milestoneUnassignedEventHandler,
  userAssignedEventHandler,
  userUnassignedEventHandler,
};
