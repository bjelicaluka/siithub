import { type BaseEntity, type BaseEvent } from "../../../db/base.repo.utils";
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

export enum CommentState {
  Existing,
  Hidden,
  Deleted,
}

export type Reactions = {
  [code: string]: number;
};

export type Comment = BaseEntity & {
  text: string;
  state: CommentState;
  reactions: Reactions;
};

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
