import { type BaseRepo, BaseRepoFactory } from "../../db/base.repo.utils";
import { type User, type UserCreate, type UserUpdate } from "./user.model";

const collectionName = "user";

async function findByUsername(username: string): Promise<User | null> {
  return (await userRepo.crud.findManyCursor({ username })).next();
}

async function findByGithubUsername(username: string): Promise<User | null> {
  return (await userRepo.crud.findManyCursor({ githubAccount: { username } })).next();
}

export type UserRepo = {
  findByUsername(username: string): Promise<User | null>,
  findByGithubUsername(username: string): Promise<User | null>,
  crud: BaseRepo<User, UserCreate, UserUpdate>,
}

const userRepo: UserRepo = {
  findByUsername,
  findByGithubUsername,
  crud: BaseRepoFactory<User, UserCreate, UserUpdate>(collectionName),
};

export { userRepo };