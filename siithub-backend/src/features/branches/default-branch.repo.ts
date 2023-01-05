import { type BaseRepo, BaseRepoFactory } from "../../db/base.repo.utils";
import { type Repository } from "../repository/repository.model";
import { type DefaultBranch } from "./branches.models";

const collectionName = "defaultBranches";

async function findByRepository(repositoryId: Repository["_id"]): Promise<DefaultBranch | null> {
  return (await defaultBranchRepo.crud.findManyCursor({ repositoryId })).next();
}

export type DefaultBranchRepoRepo = {
  crud: BaseRepo<DefaultBranch>;
  findByRepository(repositoryId: Repository["_id"]): Promise<DefaultBranch | null>;
};

const defaultBranchRepo: DefaultBranchRepoRepo = {
  crud: BaseRepoFactory<DefaultBranch>(collectionName),
  findByRepository,
};

export { defaultBranchRepo };
