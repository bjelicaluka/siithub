import { type BaseRepo, BaseRepoFactory } from "../../db/base.repo.utils";
import { type Repository } from "../repository/repository.model";
import { type Tag, type TagCreate } from "./tags.model";

const collectionName = "tags";

async function findByRepositoryId(repositoryId: Repository["_id"]): Promise<Tag[]> {
  return (await tagsRepo.crud.findManyCursor({ repositoryId })).toArray();
}

async function searchByNameAndRepositoryId(name: string, repositoryId: Repository["_id"]): Promise<Tag[]> {
  return (await tagsRepo.crud.findManyCursor({ name: { $regex: name, $options: "i" }, repositoryId })).toArray();
}

async function findLatestByRepositoryId(repositoryId: Repository["_id"]): Promise<Tag | null> {
  return (await tagsRepo.crud.findManyCursor({ repositoryId, isLatest: true })).next();
}

async function countByRepositoryId(repositoryId: Repository["_id"]): Promise<number> {
  return await tagsRepo.crud.count({ repositoryId });
}

async function findByVersionAndRepositoryId(version: string, repositoryId: Repository["_id"]): Promise<Tag | null> {
  return (await tagsRepo.crud.findManyCursor({ version, repositoryId })).next();
}

export type TagsRepo = {
  crud: BaseRepo<Tag, TagCreate>;
  findByRepositoryId(repositoryId: Repository["_id"]): Promise<Tag[]>;
  searchByNameAndRepositoryId(name: string, repositoryId: Repository["_id"]): Promise<Tag[]>;
  findLatestByRepositoryId(repositoryId: Repository["_id"]): Promise<Tag | null>;
  countByRepositoryId(repositoryId: Repository["_id"]): Promise<number>;
  findByVersionAndRepositoryId(version: string, repositoryId: Repository["_id"]): Promise<Tag | null>;
};

const tagsRepo: TagsRepo = {
  crud: BaseRepoFactory<Tag, TagCreate>(collectionName),
  findByRepositoryId,
  searchByNameAndRepositoryId,
  findLatestByRepositoryId,
  countByRepositoryId,
  findByVersionAndRepositoryId,
};

export { tagsRepo };
