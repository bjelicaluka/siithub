import { defaultBranchService } from "../branches/default-branch.service";
import { Commit, type CommitsWithRepo } from "../commits/commit.model";
import { type Issue, type IssueWithRepository } from "../issue/issue.model";
import { type PullRequestsWithRepository } from "../pull-requests/pull-requests.model";
import { type Repository } from "../repository/repository.model";
import { type User } from "../user/user.model";
import { pullRequestsRepo } from "../pull-requests/pull-requests.repo";
import { repositoryRepo } from "../repository/repository.repo";
import { commitService } from "../commits/commit.service";
import { repositoryService } from "../repository/repository.service";
import { userRepo } from "../user/user.repo";
import { issueRepo } from "../issue/issue.repo";

async function searchRepositories(searchParam: string, sort?: any): Promise<Repository[]> {
  const formatSort = (sort: any) => ({ [Object.keys(sort)[0]]: sort[Object.keys(sort)[0]] });
  const sortParams = sort ? formatSort(sort) : { name: 1 };

  return await (await repositoryRepo.crud.findManyCursor(getRepoOptions(searchParam) as any))
    .sort(sortParams as any)
    .toArray();
}

async function countRepositories(searchParam: string): Promise<number> {
  return await repositoryRepo.crud.count(getRepoOptions(searchParam) as any);
}

async function searchUsers(searchParam: string, sort?: any): Promise<User[]> {
  const formatSort = (sort: any) => ({ [Object.keys(sort)[0]]: sort[Object.keys(sort)[0]] });
  const sortParams = sort ? formatSort(sort) : { username: 1 };
  return (await userRepo.crud.findManyCursor(getUserOptions(searchParam))).sort(sortParams as any).toArray();
}

async function countUsers(searchParam: string): Promise<number> {
  return await userRepo.crud.count(getUserOptions(searchParam));
}

async function searchPullRequest(
  searchParam: string,
  repositoryId: Repository["_id"],
  sort?: any
): Promise<PullRequestsWithRepository> {
  const formatSort = (sort: any) => ({ [Object.keys(sort)[0]]: sort[Object.keys(sort)[0]] });
  const sortParams = sort ? formatSort(sort) : { "csm.timeStamp": -1 };
  const repository = (await repositoryRepo.crud.findOne(repositoryId)) as Repository;
  return {
    requests: await (
      await pullRequestsRepo.crud.findManyCursor(getPullRequestOptions(searchParam, repositoryId), {
        projection: { events: 0 },
      })
    )
      .sort(sortParams as any)
      .toArray(),
    repository,
  };
}

async function countPullRequest(searchParam: string, repositoryId: Repository["_id"]): Promise<number> {
  return await pullRequestsRepo.crud.count(getPullRequestOptions(searchParam, repositoryId));
}

async function searchIssues(
  searchParam: string,
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

  const repoIds = issues?.map((i) => i.repositoryId);
  const repo = await repositoryService.findByIds(repoIds, !repositoryId ? "public" : undefined);

  const repoMap = repo?.reduce((acc: any, r: Repository) => {
    acc[r?._id?.toString()] = r;
    return acc;
  }, {});

  const issuesWithRepos = issues
    .map?.((i: Issue) => ({
      ...i,
      repository: repoMap[i.repositoryId?.toString()],
    }))
    .filter((i) => !!i.repository);

  return issuesWithRepos;
}

async function countIssues(searchParam: string, repositoryId?: Repository["_id"]): Promise<number> {
  return (await searchIssues(searchParam, repositoryId)).length;
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

function getRepoOptions(searchParam: string) {
  return {
    $or: [
      { name: { $regex: searchParam, $options: "i" }, type: "public" },
      { description: { $regex: searchParam, $options: "i" }, type: "public" },
    ],
  };
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
function getIssueOptions(searchParam: string, repositoryId?: Repository["_id"]) {
  return {
    ...(repositoryId ? { repositoryId } : {}),
    $or: [
      { "csm.title": { $regex: searchParam, $options: "i" } },
      { "csm.description": { $regex: searchParam, $options: "i" } },
    ],
  };
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
export type AdvanceSearchService = {
  searchRepositories(searchParam: string, sort?: any): Promise<Repository[]>;
  countRepositories(searchParam: string): Promise<number>;
  searchUsers(searchParam: string, sort?: any): Promise<User[]>;
  countUsers(searchParam: string): Promise<number>;
  searchIssues(searchParam: string, repositoryId?: Repository["_id"], sort?: any): Promise<Issue[]>;
  countIssues(searchParam: string, repositoryId?: Repository["_id"]): Promise<number>;
  searchCommits(searchParam: string, repositoryId: Repository["_id"], sort?: any): Promise<CommitsWithRepo>;
  countCommits(searchParam: string, repositoryId: Repository["_id"]): Promise<number>;
  searchPullRequest(
    searchParam: string,
    repositoryId: Repository["_id"],
    sort?: any
  ): Promise<PullRequestsWithRepository>;
  countPullRequest(searchParam: string, repositoryId: Repository["_id"]): Promise<number>;
};

const advanceSearchService: AdvanceSearchService = {
  searchRepositories,
  countRepositories,
  searchUsers,
  countUsers,
  searchIssues,
  countIssues,
  searchCommits,
  countCommits,
  searchPullRequest,
  countPullRequest,
};

export { advanceSearchService };
