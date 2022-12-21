import { type BaseRepo, BaseRepoFactory } from "../../db/base.repo.utils";
import {
  type Repository,
  type RepositoryCreate,
  type RepositoryUpdate,
} from "./repository.model";

const collectionName = "repository";

export type RepositoryRepo = {
  crud: BaseRepo<Repository, RepositoryCreate, RepositoryUpdate>;
};

const repositoryRepo: RepositoryRepo = {
  crud: BaseRepoFactory<Repository, RepositoryCreate, RepositoryUpdate>(
    collectionName
  ),
};

export { repositoryRepo };
