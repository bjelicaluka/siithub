import { defaultBranchService } from "../branches/default-branch.service";
import { type Commit, type CommitsWithRepo } from "../commits/commit.model";
import { type Issue, type IssueWithRepository } from "../issue/issue.model";
import { type PullRequestWithRepository } from "../pull-requests/pull-requests.model";
import { type Repository } from "../repository/repository.model";
import { type User } from "../user/user.model";
import { pullRequestsRepo } from "../pull-requests/pull-requests.repo";
import { repositoryRepo } from "../repository/repository.repo";
import { commitService } from "../commits/commit.service";
import { repositoryService } from "../repository/repository.service";
import { userRepo } from "../user/user.repo";
import { issueRepo } from "../issue/issue.repo";
import { type TagWithRepository } from "../tags/tags.model";
import { tagsRepo } from "../tags/tags.repo";

async function searchRepositories(searchParam: string, userId: User["_id"], sort?: any): Promise<Repository[]> {
  const formatSort = (sort: any) => ({ [Object.keys(sort)[0]]: sort[Object.keys(sort)[0]] });
  const sortParams = sort ? formatSort(sort) : { name: 1 };

  return await (await repositoryRepo.crud.findManyCursor((await getRepoOptions(searchParam, userId)) as any))
    .sort(sortParams as any)
    .toArray();
}

async function countRepositories(searchParam: string, userId: User["_id"]): Promise<number> {
  return await repositoryRepo.crud.count((await getRepoOptions(searchParam, userId)) as any);
}

async function getRepoOptions(searchParam: string, userId: User["_id"]) {
  const repoIds = (await repositoryService.getRelevantRepos(userId)).map((r) => r._id);

  return {
    $or: [
      { name: { $regex: searchParam, $options: "i" }, type: "public" },
      { description: { $regex: searchParam, $options: "i" }, type: "public" },
      { name: { $regex: searchParam, $options: "i" }, _id: { $in: repoIds } },
      { description: { $regex: searchParam, $options: "i" }, _id: { $in: repoIds } },
    ],
  };
}

async function searchUsers(searchParam: string, sort?: any): Promise<User[]> {
  const formatSort = (sort: any) => ({ [Object.keys(sort)[0]]: sort[Object.keys(sort)[0]] });
  const sortParams = sort ? formatSort(sort) : { username: 1 };
  return (await userRepo.crud.findManyCursor(getUserOptions(searchParam))).sort(sortParams as any).toArray();
}

async function countUsers(searchParam: string): Promise<number> {
  return await userRepo.crud.count(getUserOptions(searchParam));
}

function getUserOptions(searchParam: string) {
  return {
    $or: [
      { name: { $regex: searchParam, $options: "i" } },
      { username: { $regex: searchParam, $options: "i" } },
      { email: { $regex: searchParam, $options: "i" } },
      { bio: { $regex: searchParam, $options: "i" } },
    ],
  };
}

async function searchPullRequest(
  searchParam: string,
  userId: User["_id"],
  repositoryId?: Repository["_id"],
  sort?: any
): Promise<PullRequestWithRepository[]> {
  const formatSort = (sort: any) => ({ [Object.keys(sort)[0]]: sort[Object.keys(sort)[0]] });
  const sortParams = sort ? formatSort(sort) : { "csm.timeStamp": -1 };

  const pullRequests = await (
    await pullRequestsRepo.crud.findManyCursor(getPullRequestOptions(searchParam, repositoryId))
  )
    .sort(sortParams)
    .toArray();

  const repos = await getRepos(pullRequests, userId, repositoryId);
  const repoMap = await getMapOfRepos(repos);

  return connectWithRepo(pullRequests, repoMap);
}

async function countPullRequest(
  searchParam: string,
  userId: User["_id"],
  repositoryId?: Repository["_id"]
): Promise<number> {
  return (await searchPullRequest(searchParam, userId, repositoryId)).length;
}

function getPullRequestOptions(searchParam: string, repositoryId?: Repository["_id"]) {
  return {
    ...(repositoryId ? { repositoryId } : {}),
    $or: [
      { "csm.title": { $regex: searchParam, $options: "i" } },
      { "csm.base": { $regex: searchParam, $options: "i" } },
      { "csm.compare": { $regex: searchParam, $options: "i" } },
    ],
  };
}

async function searchTags(
  searchParam: string,
  userId: User["_id"],
  repositoryId?: Repository["_id"],
  sort?: any
): Promise<TagWithRepository[]> {
  const formatSort = (sort: any) => ({ [Object.keys(sort)[0]]: sort[Object.keys(sort)[0]] });
  const sortParams = sort ? formatSort(sort) : { timeStamp: -1 };

  const tags = await (await tagsRepo.crud.findManyCursor(getTagsOptions(searchParam, repositoryId)))
    .sort(sortParams as any)
    .toArray();

  const repos = await getRepos(tags, userId, repositoryId);
  const repoMap = await getMapOfRepos(repos);

  return connectWithRepo(tags, repoMap);
}

async function countTags(searchParam: string, userId: User["_id"], repositoryId?: Repository["_id"]): Promise<number> {
  return (await searchTags(searchParam, userId, repositoryId)).length;
}

function getTagsOptions(searchParam: string, repositoryId?: Repository["_id"]) {
  return {
    ...(repositoryId ? { repositoryId } : {}),
    $or: [
      { name: { $regex: searchParam, $options: "i" } },
      { description: { $regex: searchParam, $options: "i" } },
      { version: { $regex: searchParam, $options: "i" } },
    ],
  };
}

async function searchIssues(
  searchParam: string,
  userId: User["_id"],
  repositoryId?: Repository["_id"],
  sort?: any
): Promise<IssueWithRepository[]> {
  const formatSort = (sort: any) => ({ [Object.keys(sort)[0]]: sort[Object.keys(sort)[0]] });
  const sortParams = sort ? formatSort(sort) : { "csm.timeStamp": -1 };

  const issues = await (
    await issueRepo.crud.findManyCursor(getIssueOptions(searchParam, repositoryId), {
      projection: { events: 0, "csm.comments": 0 },
    })
  )
    .sort(sortParams as any)
    .toArray();

  const repos = await getRepos(issues, userId, repositoryId);
  const repoMap = getMapOfRepos(repos);

  return connectWithRepo(issues, repoMap);
}

async function countIssues(
  searchParam: string,
  userId: User["_id"],
  repositoryId?: Repository["_id"]
): Promise<number> {
  return (await searchIssues(searchParam, userId, repositoryId)).length;
}

function getIssueOptions(searchParam: string, repositoryId?: Repository["_id"]) {
  return {
    ...(repositoryId ? { repositoryId } : {}),
    $or: [
      { "csm.title": { $regex: searchParam, $options: "i" } },
      { "csm.description": { $regex: searchParam, $options: "i" } },
    ],
  };
}

async function searchCommits(
  searchParam: string,
  repositoryId: Repository["_id"],
  sort?: any
): Promise<CommitsWithRepo> {
  const direction = sort ? sort["date"] : 1;

  const repository = (await repositoryRepo.crud.findOne(repositoryId)) as Repository;
  const defaultBranch = await defaultBranchService.findByRepository(repository.owner, repository.name);

  const commits = await commitService.getCommits(repository.owner, repository.name, defaultBranch?.branch || "");

  return {
    commits: commits
      .filter((c) => c.message.toLowerCase().includes(searchParam.toLowerCase()))
      .sort((c1: Commit, c2: Commit) => direction * Number(new Date(c2.date)) - direction * Number(new Date(c1.date))),
    repository,
  };
}

async function countCommits(searchParam: string, repositoryId: Repository["_id"]): Promise<number> {
  const repository = (await repositoryRepo.crud.findOne(repositoryId)) as Repository;
  const defaultBranch = await defaultBranchService.findByRepository(repository.owner, repository.name);

  const commits = await commitService.getCommits(repository.owner, repository.name, defaultBranch?.branch || "");

  return commits.filter((c) => c.message.toLowerCase().includes(searchParam.toLowerCase())).length;
}

async function getRepos(
  objectList: { repositoryId: Repository["_id"] }[],
  userId: User["_id"],
  repositoryId?: Repository["_id"]
) {
  const repoIds = objectList?.map((o) => o.repositoryId);
  const publicRepos = await repositoryService.findByIds(repoIds, !repositoryId ? "public" : undefined);
  const relRepos = repositoryId ? [] : await repositoryService.getRelevantRepos(userId);
  return [...publicRepos, ...relRepos];
}

function getMapOfRepos(repo: Repository[]) {
  return repo?.reduce((acc: any, r: Repository) => {
    acc[r?._id?.toString()] = r;
    return acc;
  }, {});
}

function connectWithRepo(objectList: { repositoryId: Repository["_id"] }[], repoMap: Repository[]) {
  return objectList
    .map?.((o: any) => ({
      ...o,
      repository: repoMap[o.repositoryId?.toString()],
    }))
    .filter((o) => !!o.repository);
}

export type AdvanceSearchService = {
  searchRepositories(searchParam: string, userId: User["_id"], sort?: any): Promise<Repository[]>;
  countRepositories(searchParam: string, userId: User["_id"]): Promise<number>;
  searchUsers(searchParam: string, sort?: any): Promise<User[]>;
  countUsers(searchParam: string): Promise<number>;
  searchTags(
    searchParam: string,
    userId: User["_id"],
    repositoryId?: Repository["_id"],
    sort?: any
  ): Promise<TagWithRepository[]>;
  countTags(searchParam: string, userId: User["_id"], repositoryId?: Repository["_id"]): Promise<number>;
  searchIssues(
    searchParam: string,
    userId: User["_id"],
    repositoryId?: Repository["_id"],
    sort?: any
  ): Promise<Issue[]>;
  countIssues(searchParam: string, userId: User["_id"], repositoryId?: Repository["_id"]): Promise<number>;
  searchCommits(searchParam: string, repositoryId: Repository["_id"], sort?: any): Promise<CommitsWithRepo>;
  countCommits(searchParam: string, repositoryId: Repository["_id"]): Promise<number>;
  searchPullRequest(
    searchParam: string,
    userId: User["_id"],
    repositoryId?: Repository["_id"],
    sort?: any
  ): Promise<PullRequestWithRepository[]>;
  countPullRequest(searchParam: string, userId: User["_id"], repositoryId?: Repository["_id"]): Promise<number>;
};

const advanceSearchService: AdvanceSearchService = {
  searchRepositories,
  countRepositories,
  searchUsers,
  countUsers,
  searchTags,
  countTags,
  searchIssues,
  countIssues,
  searchCommits,
  countCommits,
  searchPullRequest,
  countPullRequest,
};

export { advanceSearchService };
