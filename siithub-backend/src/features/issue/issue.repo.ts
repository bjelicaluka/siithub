import { ObjectId } from "mongodb";
import { type BaseRepo, BaseRepoFactory } from "../../db/base.repo.utils";
import { type Repository } from "../repository/repository.model";
import { type Issue } from "./issue.model";
import { type IssuesQuery } from "./issue.query";

const collectionName = "issue";

async function findByRepositoryId(repositoryId: Repository["_id"]): Promise<Issue[]> {
  return (await issueRepo.crud.findManyCursor({ repositoryId })).toArray();
}

async function findByRepositoryIdAndLocalId(repositoryId: Repository["_id"], localId: number): Promise<Issue | null> {
  return (await issueRepo.crud.findManyCursor({ localId, repositoryId })).next();
}

async function searchByQuery(query: IssuesQuery, repositoryId: Repository["_id"]): Promise<Issue[]> {
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

  return (await issueRepo.crud.findManyCursor(searchParams)).sort(sortParams).toArray();
}

export type IssueRepo = {
  crud: BaseRepo<Issue>;
  findByRepositoryId(repositoryId: Repository["_id"]): Promise<Issue[]>;
  searchByQuery(query: IssuesQuery, repositoryId: Repository["_id"]): Promise<Issue[]>;
  findByRepositoryIdAndLocalId(repositoryId: Repository["_id"], localId: number): Promise<Issue | null>;
};

const issueRepo: IssueRepo = {
  crud: BaseRepoFactory<Issue>(collectionName),
  findByRepositoryId,
  searchByQuery,
  findByRepositoryIdAndLocalId,
};

export { issueRepo };
