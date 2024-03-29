import { type BaseRepo, BaseRepoFactory } from "../../db/base.repo.utils";
import { type Repository } from "../repository/repository.model";
import { type Milestone, type MilestoneCreate, type MilestoneUpdate } from "./milestone.model";

const collectionName = "milestone";

async function findByRepositoryId(repositoryId: Repository["_id"], isOpen = true): Promise<Milestone[]> {
  return (await milestoneRepo.crud.findManyCursor({ repositoryId, isOpen })).toArray();
}

async function findByTitleAndRepositoryId(title: string, repositoryId: Repository["_id"]): Promise<Milestone | null> {
  return (await milestoneRepo.crud.findManyCursor({ title, repositoryId })).next();
}

async function findByRepositoryIdAndLocalId(repositoryId: Repository["_id"], localId: number): Promise<Milestone | null> {
  return (await milestoneRepo.crud.findManyCursor({ localId, repositoryId })).next();
}

async function searchByTitle(title: string, repositoryId: Repository["_id"]): Promise<Milestone[] | null> {
  return (await milestoneRepo.crud.findManyCursor({ title: { $regex: title, $options: 'i' }, repositoryId })).toArray();
}

export type MilestoneRepo = {
  crud: BaseRepo<Milestone, MilestoneCreate, MilestoneUpdate>,
  findByRepositoryId(repositoryId: Repository["_id"], isOpen?: boolean): Promise<Milestone[]>,
  findByTitleAndRepositoryId(title: string, repositoryId: Repository["_id"]): Promise<Milestone | null>,
  searchByTitle(title: string, repositoryId: Repository["_id"]): Promise<Milestone[] | null>,
  findByRepositoryIdAndLocalId(repositoryId: Repository["_id"], localId: number): Promise<Milestone | null>
}

const milestoneRepo: MilestoneRepo = {
  crud: BaseRepoFactory<Milestone, MilestoneCreate, MilestoneUpdate>(collectionName),
  findByRepositoryId,
  findByTitleAndRepositoryId,
  searchByTitle,
  findByRepositoryIdAndLocalId
};

export { milestoneRepo };