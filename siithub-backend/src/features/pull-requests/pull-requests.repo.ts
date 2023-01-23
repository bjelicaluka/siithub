import { ObjectId } from "mongodb";
import { type BaseRepo, BaseRepoFactory } from "../../db/base.repo.utils";
import { type Repository } from "../repository/repository.model";
import { type PullRequest } from "./pull-requests.model";
import { type PullRequestsQuery } from "./pull-requests.query";

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

async function searchByQuery(query: PullRequestsQuery, repositoryId: Repository["_id"]): Promise<PullRequest[]> {
  const { title, state, author, assignees, labels, milestones, sort } = query;

  const searchParams = {
    repositoryId,
    ...(title ? { "csm.title": { $regex: title, $options: "i" } } : {}),
    ...(state ? { "csm.state": { $in: state } } : {}),
    ...(author ? { "csm.author": new ObjectId(author?.toString()) } : {}),
    ...(assignees && assignees.length ? { "csm.assignees": { $all: assignees } } : {}),
    ...(labels && labels.length ? { "csm.labels": { $all: labels } } : {}),
    ...(milestones && milestones.length ? { "csm.milestones": { $all: milestones } } : {}),
  };

  const formatSort = (sort: any) => ({ ["csm." + Object.keys(sort)[0]]: sort[Object.keys(sort)[0]] });
  const sortParams = sort ? formatSort(sort) : { "csm.timeStamp": -1 };

  return (await pullRequestsRepo.crud.findManyCursor(searchParams)).sort(sortParams).toArray();
}

export type PullRequestsRepo = {
  crud: BaseRepo<PullRequest>;
  findByRepositoryId(repositoryId: Repository["_id"]): Promise<PullRequest[]>;
  findByRepositoryIdAndLocalId(repositoryId: Repository["_id"], localId: number): Promise<PullRequest | null>;
  searchByQuery(query: PullRequestsQuery, repositoryId: Repository["_id"]): Promise<PullRequest[]>;
};

const pullRequestsRepo: PullRequestsRepo = {
  crud: BaseRepoFactory<PullRequest>(collectionName),
  findByRepositoryId,
  findByRepositoryIdAndLocalId,
  searchByQuery,
};

export { pullRequestsRepo };
