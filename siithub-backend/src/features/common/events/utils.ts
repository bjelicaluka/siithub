import { type BaseEvent, type BaseEntity } from "../../../db/base.repo.utils";

function findLastEvent<T>(events: BaseEvent[], f: (arg0: T) => boolean) {
  return events
    .filter((e) => f(e as T))
    .sort((e1, e2) => e1.timeStamp.getTime() - e2.timeStamp.getTime())
    .pop();
}

function compareIds(id1: BaseEntity["_id"], id2: BaseEntity["_id"]) {
  return id1 === id2 || id1?.toString() === id2?.toString();
}

export { findLastEvent, compareIds };
