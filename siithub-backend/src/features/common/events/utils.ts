import { type BaseEvent, type BaseEntity } from "../../../db/base.repo.utils";
import {
  type Comment,
  type CommentCreatedEvent,
  type CommentDeletedEvent,
  type CommentHiddenEvent,
} from "./events.model";

function findLastEvent<T>(events: BaseEvent[], f: (arg0: T) => boolean) {
  return events
    .filter((e) => f(e as T))
    .sort((e1, e2) => e1.timeStamp.getTime() - e2.timeStamp.getTime())
    .pop();
}

function compareIds(id1: BaseEntity["_id"], id2: BaseEntity["_id"]) {
  return id1 === id2 || id1?.toString() === id2?.toString();
}

function canCommentBeModified({ events }: any, commentId: Comment["_id"]): boolean {
  const lastCommentEvent = findLastEvent<CommentCreatedEvent | CommentHiddenEvent | CommentDeletedEvent>(
    events,
    (e) =>
      ["CommentCreatedEvent", "CommentHiddenEvent", "CommentDeletedEvent"].includes(e.type) &&
      compareIds(e.commentId, commentId)
  );

  return !(
    !lastCommentEvent ||
    lastCommentEvent?.type === "CommentHiddenEvent" ||
    lastCommentEvent?.type === "CommentDeletedEvent"
  );
}

function findComment({ csm }: any, commentId: Comment["_id"]): Comment {
  return csm.comments?.find(
    (c: Comment) => c._id === commentId || c._id?.toString() === commentId?.toString()
  ) as Comment;
}

export { findLastEvent, compareIds, canCommentBeModified, findComment };
