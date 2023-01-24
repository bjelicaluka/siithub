import { defaultBranchRepo } from "../branches/default-branch.repo";
import { defaultBranchService } from "../branches/default-branch.service";
import { Commit } from "../commits/commit.model";
import { commitService } from "../commits/commit.service";
import { Issue } from "../issue/issue.model";
import { issueRepo } from "../issue/issue.repo";
import { type Repository } from "../repository/repository.model";
import { repositoryRepo } from "../repository/repository.repo";
import { User } from "../user/user.model";
import { userRepo } from "../user/user.repo";

async function searchRepositories(searchParam: string): Promise<Repository[]> {
  return await repositoryRepo.crud.findMany(getRepoOptions(searchParam));
}
async function countRepositories(searchParam: string): Promise<number> {
  return await repositoryRepo.crud.count(getRepoOptions(searchParam));
}
async function searchUsers(searchParam: string): Promise<User[]> {
  return await userRepo.crud.findMany(getUserOptions(searchParam));
}
async function countUsers(searchParam: string): Promise<number> {
  return await userRepo.crud.count(getUserOptions(searchParam));
}
async function searchIssues(searchParam: string, repositoryId?: Repository["_id"]): Promise<Issue[]> {
  return await issueRepo.crud.findMany(getIssueOptions(searchParam, repositoryId));
}
async function countIssues(searchParam: string, repositoryId?: Repository["_id"]): Promise<number> {
  return await issueRepo.crud.count(getIssueOptions(searchParam, repositoryId));
}
async function searchCommits(searchParam: string, repositoryId: string): Promise<Commit[]> {
  const repository = (await repositoryRepo.crud.findOne(repositoryId)) as Repository;
  const defaultBranch = await defaultBranchService.findByRepository(repository.owner, repository.name);

  const commits = await commitService.getCommits(repository.owner, repository.name, defaultBranch?.branch || "");

  return commits.filter((c) => c.message.toLowerCase().includes(searchParam.toLowerCase()));
}

async function countCommits(searchParam: string, repositoryId: string): Promise<number> {
  const repository = (await repositoryRepo.crud.findOne(repositoryId)) as Repository;
  const defaultBranch = await defaultBranchService.findByRepository(repository.owner, repository.name);

  const commits = await commitService.getCommits(repository.owner, repository.name, defaultBranch?.branch || "");

  return commits.filter((c) => c.message.toLowerCase().includes(searchParam.toLowerCase())).length;
}
function getRepoOptions(searchParam: string) {
  return {
    $or: [{ name: { $regex: searchParam, $options: "i" } }, { description: { $regex: searchParam, $options: "i" } }],
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
export type AdvanceSearchService = {
  searchRepositories(searchParam: string): Promise<Repository[]>;
  countRepositories(searchParam: string): Promise<number>;
  searchUsers(searchParam: string): Promise<User[]>;
  countUsers(searchParam: string): Promise<number>;
  searchIssues(searchParam: string, repositoryId?: Repository["_id"]): Promise<Issue[]>;
  countIssues(searchParam: string, repositoryId?: Repository["_id"]): Promise<number>;
  searchCommits(searchParam: string, repositoryId: string): Promise<Commit[]>;
  countCommits(searchParam: string, repositoryId: string): Promise<number>;
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
};

export { advanceSearchService };
