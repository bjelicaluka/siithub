import { type BaseRepo, BaseRepoFactory } from "../../db/base.repo.utils";
import { type Repository } from "../repository/repository.model";
import { type User } from "../user/user.model";
import type { StarCreate, Star } from "./star.model";

const collectionName = "star";

async function findByUserIdAndRepoId(userId: User["_id"], repoId: Repository["_id"]): Promise<Star | null> {
  return (await starRepo.crud.findManyCursor({ userId, repoId })).next();
}

export type StarRepo = {
  crud: BaseRepo<Star, StarCreate, {}>;
  findByUserIdAndRepoId(userId: User["_id"], repoId: Repository["_id"]): Promise<Star | null>;
};

const starRepo: StarRepo = {
  crud: BaseRepoFactory<Star, StarCreate, {}>(collectionName),
  findByUserIdAndRepoId,
};

export { starRepo };
