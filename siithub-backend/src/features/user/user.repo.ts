import { type BaseRepo, BaseRepoFactory } from "../../db/base.repo.utils";
import { type User, type UserCreate, type UserUpdate } from "./user.model";

const collectionName = "user";

async function findByUsername(username: string): Promise<User | null> {
  return (await userRepo.crud.findManyCursor({ username })).next();
}

export type UserRepo = {
  crud: BaseRepo<User, UserCreate, UserUpdate>,
  findByUsername(username: string): Promise<User | null>
}

const userRepo: UserRepo = {
  crud: BaseRepoFactory<User, UserCreate, UserUpdate>(collectionName),
  findByUsername
};

export { userRepo };