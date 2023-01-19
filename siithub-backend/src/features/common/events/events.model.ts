import { type BaseEvent } from "../../../db/base.repo.utils";
import { type Label } from "../../label/label.model";
import { type Milestone } from "../../milestone/milestone.model";
import { type User } from "../../user/user.model";

export type LabelAssignedEvent = BaseEvent & { labelId: Label["_id"] };
export type LabelUnassignedEvent = BaseEvent & { labelId: Label["_id"] };

export type MilestoneAssignedEvent = BaseEvent & {
  milestoneId: Milestone["_id"];
};
export type MilestoneUnassignedEvent = BaseEvent & {
  milestoneId: Milestone["_id"];
};

export type UserAssignedEvent = BaseEvent & { userId: User["_id"] };
export type UserUnassignedEvent = BaseEvent & { userId: User["_id"] };
