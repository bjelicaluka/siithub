import axios from "axios";
import { config } from "../../config";
import { BadLogicException } from "../../error-handling/errors";

async function getBranches(username: string, repoName: string): Promise<string[]> {
  const response = await axios.get(`${config.gitServer.url}/api/branches/${username}/${repoName}`);
  if (response.status !== 200) {
    throw new BadLogicException("Error while getting repository branches.");
  }

  return response.data;
}

async function createBranch(username: string, repoName: string, source: string, branchName: string): Promise<string> {
  const response = await axios.post(`${config.gitServer.url}/api/branches/${username}/${repoName}`, {
    source,
    branchName,
  });

  if (response.status !== 200) {
    throw new BadLogicException("Error while creating a new repository branch.");
  }

  return response.data;
}

async function renameBranch(
  username: string,
  repoName: string,
  branchName: string,
  newBranchName: string
): Promise<string> {
  const response = await axios.put(
    `${config.gitServer.url}/api/branches/${username}/${repoName}/${encodeURIComponent(branchName)}`,
    {
      newBranchName,
    }
  );

  if (response.status !== 200) {
    throw new BadLogicException("Error while renaming an existing repository branch.");
  }

  return response.data;
}

async function removeBranch(username: string, repoName: string, branchName: string): Promise<string> {
  const response = await axios.delete(
    `${config.gitServer.url}/api/branches/${username}/${repoName}/${encodeURIComponent(branchName)}`
  );

  if (response.status !== 200) {
    throw new BadLogicException("Error while removing an existing repository branch.");
  }

  return response.data;
}

export type GitServerBranchesClient = {
  getBranches(username: string, repoName: string): Promise<string[]>;
  createBranch(username: string, repoName: string, source: string, branchName: string): Promise<string>;
  renameBranch(username: string, repoName: string, branchName: string, newBranchName: string): Promise<string>;
  removeBranch(username: string, repoName: string, branchName: string): Promise<string>;
};

const gitServerBranchesClient: GitServerBranchesClient = {
  getBranches,
  createBranch,
  renameBranch,
  removeBranch,
};

export { gitServerBranchesClient };
