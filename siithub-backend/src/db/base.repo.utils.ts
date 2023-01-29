import { Document, Filter, FindCursor, FindOptions, Timestamp, WithId } from "mongodb";
import { getCollection } from "./mongo.utils";

export type BaseEntity = {
  _id: Pick<WithId<Document>, "id">;
};

export type BaseEvent = BaseEntity & {
  streamId: Pick<WithId<Document>, "id">;
  timeStamp: Date;
  by: Pick<WithId<Document>, "id">;
  type: string;
};

export type AggregateRoot<TCsm> = BaseEntity & {
  csm: TCsm;
  events: BaseEvent[];
};

export type BaseRepo<
  T extends BaseEntity,
  TCreate extends Document = Omit<T, "_id">,
  TUpdate extends Document = Partial<Omit<T, "_id">>
> = {
  findOne(id: T["_id"] | string): Promise<T | null>;
  findMany(filter?: Filter<T>, options?: FindOptions<T>): Promise<T[]>;
  findManyCursor(filter: Filter<T>, options?: FindOptions<T>): Promise<FindCursor<T>>;
  add(entity: TCreate): Promise<T | null>;
  update(id: T["_id"] | string, entity: TUpdate): Promise<T | null>;
  delete(id: T["_id"] | string): Promise<T | null>;
  count(filter: Filter<T>): Promise<number>;
};

export const BaseRepoFactory = <
  T extends BaseEntity,
  TCreate extends Document = Partial<Omit<T, "_id">>,
  TUpdate extends Document = TCreate
>(
  collectionName: string
) => {
  return {
    async findOne(id: T["_id"] | string): Promise<T | null> {
      const collection = await getCollection(collectionName);
      return collection.findOne({ _id: id }) as Promise<T | null>;
    },
    async findMany(filter: Filter<T> = {}, options: FindOptions<T> = {}): Promise<T[]> {
      return (await this.findManyCursor(filter, options)).toArray();
    },
    async findManyCursor(filter: Filter<T> = {}, options: FindOptions<T> = {}): Promise<FindCursor<T>> {
      const collection = await getCollection(collectionName);
      return collection.find(filter, options) as unknown as Promise<FindCursor<T>>;
    },
    async add(entity: TCreate): Promise<T | null> {
      const collection = await getCollection(collectionName);
      const result = await collection.insertOne(entity);
      return this.findOne(result.insertedId);
    },
    async update(id: T["_id"] | string, entity: TUpdate): Promise<T | null> {
      const collection = await getCollection(collectionName);
      await collection.updateOne({ _id: id }, { $set: entity });
      return this.findOne(id);
    },
    async delete(id: T["_id"] | string): Promise<T | null> {
      const collection = await getCollection(collectionName);
      const result = await collection.findOneAndDelete({ _id: id });
      return result.value as T | null;
    },
    async count(filter: Filter<T>): Promise<number> {
      const collection = await getCollection(collectionName);
      return collection.countDocuments(filter);
    },
  };
};
