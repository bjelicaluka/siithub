import { MissingEntityException } from "../../error-handling/errors";
import type { Repository } from "../repository/repository.model";
import type { User } from "../user/user.model";
import type { Star } from "./star.model";
import { starRepo } from "./star.repo";

async function findOneOrThrow(id: Star["_id"]): Promise<Star> {
  const star = await starRepo.crud.findOne(id);
  if (!star) {
    throw new MissingEntityException("Star with given id does not exist.");
  }
  return star;
}

async function findByRepoId(repoId: Repository["_id"]): Promise<Star[]> {
  return await starRepo.crud.findMany({ repoId });
}

async function countByRepoId(repoId: Repository["_id"]): Promise<number> {
  return await starRepo.crud.count({ repoId });
}

async function findByUserId(userId: User["_id"]): Promise<Star[]> {
  return await starRepo.crud.findMany({ userId });
}

async function countByUserId(userId: User["_id"]): Promise<number> {
  return await starRepo.crud.count({ userId });
}

async function findByUserIdAndRepoId(userId: User["_id"], repoId: Repository["_id"]): Promise<Star | null> {
  return await starRepo.findByUserIdAndRepoId(userId, repoId);
}

async function addStar(userId: User["_id"], repoId: Repository["_id"]): Promise<Star | null> {
  const existingStar = await findByUserIdAndRepoId(userId, repoId);
  if (existingStar) {
    return existingStar;
  }
  return await starRepo.crud.add({ userId, repoId, date: new Date() });
}

async function removeStar(userId: User["_id"], repoId: Repository["_id"]): Promise<Star | null> {
  const existingStar = await findByUserIdAndRepoId(userId, repoId);
  if (!existingStar) {
    return existingStar;
  }
  return await starRepo.crud.delete(existingStar._id);
}

export type StarService = {
  addStar(userId: User["_id"], repoId: Repository["_id"]): Promise<Star | null>;
  removeStar(userId: User["_id"], repoId: Repository["_id"]): Promise<Star | null>;
  findOneOrThrow(id: Star["_id"]): Promise<Star>;
  findByUserIdAndRepoId(userId: User["_id"], repoId: Repository["_id"]): Promise<Star | null>;
  findByRepoId(repoId: Repository["_id"]): Promise<Star[]>;
  countByRepoId(repoId: Repository["_id"]): Promise<number>;
  findByUserId(userId: User["_id"]): Promise<Star[]>;
  countByUserId(userId: User["_id"]): Promise<number>;
};

const starService: StarService = {
  findOneOrThrow,
  addStar,
  removeStar,
  findByUserIdAndRepoId,
  findByRepoId,
  countByRepoId,
  findByUserId,
  countByUserId,
};

export { starService };
