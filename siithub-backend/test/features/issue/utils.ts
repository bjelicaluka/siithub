import { ObjectId } from "mongodb";

function createEvent<T>(data: any): T {
  const _id: ObjectId = new ObjectId();
  const streamId: ObjectId = new ObjectId();
  const by: ObjectId = new ObjectId();
  
  return {
    _id,
    streamId,
    by,
    timeStamp: new Date(),
    ...data
  }
}

export {
  createEvent
}