import { type BaseRepo, BaseRepoFactory } from "../../db/base.repo.utils";
import { type Issue } from "./issue.model";

const collectionName = "issue";

async function findByRepositoryId(repositoryId: string): Promise<Issue[]> {
  return (await issueRepo.crud.findManyCursor({ repositoryId })).toArray();
};

// TODO: PARAMS TYPE
async function searchByParams(params: any, repositoryId: string): Promise<Issue[]> {
  const {
    title,
    state,
    author,
    assignees,
    labels,
    sort
  } = params;

  const searchParams = {
    ...(title ? { "csm.title": { $regex: title, $options: 'i' } } : {}),
    ...(state ? { "csm.state": { $in: state } } : {}),
    ...(author ? { "csm.author": author } : {}),
    ...((assignees && assignees.length) ? { "csm.assignees": { $all: assignees } } : {}),
    ...((labels && labels.length) ? { "csm.labels": { $all: labels } } : {}),
  };

  const formatSort = (sort: any) => ({ ["csm." + Object.keys(sort)[0]]: sort[Object.keys(sort)[0]] });
  const sortParams = sort ? formatSort(sort) : { "csm.timeStamp": 1 }

  return ((await issueRepo.crud.findManyCursor(searchParams)).sort(sortParams)).toArray();
}


export type IssueRepo = {
  crud: BaseRepo<Issue>,
  findByRepositoryId(repositoryId: string): Promise<Issue[]>,
  searchByParams(params: any, repositoryId: string): Promise<Issue[]>
};

const issueRepo: IssueRepo = {
  crud: BaseRepoFactory<Issue>(collectionName),
  findByRepositoryId,
  searchByParams
};

export { issueRepo };