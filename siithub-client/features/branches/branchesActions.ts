import axios from "axios";
import { type Repository } from "../repository/repository.service";

type Branch = string;

type DefaultBranch = {
  _id: string;
  repositoryId: Repository["_id"];
  branch: string;
};

function getBranches(username: string, repoName: string, name?: string): Promise<Branch[]> {
  return axios.get(`/api/${username}/${repoName}/branches`, { params: { name } });
}

function getDefaultBranch(username: string, repoName: string): Promise<Branch> {
  return axios.get(`/api/${username}/${repoName}/branches/default`);
}

function getBranchesCount(username: string, repoName: string): Promise<number> {
  return axios.get(`/api/${username}/${repoName}/branches/count`);
}

function createBranch(username: string, repoName: string) {
  return ({ branchName, source }: { source: string; branchName: string }) =>
    axios.post(`/api/${username}/${repoName}/branches`, {
      source,
      branchName,
    });
}

function renameBranch(username: string, repoName: string) {
  return ({ branchName, newBranchName }: { branchName: string; newBranchName: string }) =>
    axios.put(`/api/${username}/${repoName}/branches/${encodeURIComponent(branchName)}`, {
      newBranchName,
    });
}

function changeDefaultBranch(username: string, repoName: string) {
  return (newDefaultBranch: string) =>
    axios.put(`/api/${username}/${repoName}/branches/default/change`, {
      newBranchName: newDefaultBranch,
    });
}

function removeBranch(username: string, repoName: string) {
  return (branchName: string) =>
    axios.delete(`/api/${username}/${repoName}/branches/${encodeURIComponent(branchName)}`);
}

export type { Branch, DefaultBranch };

export {
  getBranches,
  getDefaultBranch,
  getBranchesCount,
  createBranch,
  renameBranch,
  changeDefaultBranch,
  removeBranch,
};
