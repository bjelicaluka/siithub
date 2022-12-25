import { type BaseRepo, BaseRepoFactory } from "../../db/base.repo.utils";
import {
  type Repository,
  type RepositoryCreate,
  type RepositoryUpdate,
} from "./repository.model";

const collectionName = "repository";

async function findByOwnerAndName(owner: string, name: string): Promise<Repository | null> {
  return (await repositoryRepo.crud.findManyCursor({ owner, name })).next();
}

export type RepositoryRepo = {
  crud: BaseRepo<Repository, RepositoryCreate, RepositoryUpdate>;
  findByOwnerAndName(owner: string, name: string): Promise<Repository | null>;
};

const repositoryRepo: RepositoryRepo = {
  crud: BaseRepoFactory<Repository, RepositoryCreate, RepositoryUpdate>(
    collectionName
  ),
  findByOwnerAndName,
};

export { repositoryRepo };
