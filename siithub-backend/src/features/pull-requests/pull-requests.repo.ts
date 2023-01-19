import { type BaseRepo, BaseRepoFactory } from "../../db/base.repo.utils";
import { type Repository } from "../repository/repository.model";
import { type PullRequest } from "./pull-requests.model";

const collectionName = "pull-requests";

async function findByRepositoryId(repositoryId: Repository["_id"]): Promise<PullRequest[]> {
  return (await pullRequestsRepo.crud.findManyCursor({ repositoryId })).toArray();
}

async function findByRepositoryIdAndLocalId(
  repositoryId: Repository["_id"],
  localId: number
): Promise<PullRequest | null> {
  return (await pullRequestsRepo.crud.findManyCursor({ localId, repositoryId })).next();
}

export type PullRequestsRepo = {
  crud: BaseRepo<PullRequest>;
  findByRepositoryId(repositoryId: Repository["_id"]): Promise<PullRequest[]>;
  findByRepositoryIdAndLocalId(repositoryId: Repository["_id"], localId: number): Promise<PullRequest | null>;
};

const pullRequestsRepo: PullRequestsRepo = {
  crud: BaseRepoFactory<PullRequest>(collectionName),
  findByRepositoryId,
  findByRepositoryIdAndLocalId,
};

export { pullRequestsRepo };
