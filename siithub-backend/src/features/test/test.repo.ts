import { BaseEntity, BaseRepoFactory } from "../../db/base.repo.utils";

const collectionName = "test";

export type Test = {
  name: string;
} & BaseEntity;
export type TestCreate = Omit<Test, "_id">;
export type TestUpdate = Partial<Test>;

const testRepo = {
  crud: BaseRepoFactory<Test, TestCreate, TestUpdate>(collectionName),
};
export { testRepo };
