import axios from "axios";
import { config } from "../../config";
import { type GitServerBranchesClient, gitServerBranchesClient } from "./gitserver.branches.client";
import { MissingEntityException } from "../../error-handling/errors";
import { gitServerCollaboratorsClient, GitServerCollaboratorsClient } from "./gitserver-collaborators.client";

async function createUser(username: string): Promise<any> {
  return await axios.post(`${config.gitServer.url}/api/users`, { username });
}

async function createRepository(username: string, repositoryName: string): Promise<any> {
  return await axios.post(`${config.gitServer.url}/api/repositories`, {
    username,
    repositoryName,
  });
}

async function deleteRepository(username: string, repositoryName: string): Promise<any> {
  return await axios.put(`${config.gitServer.url}/api/repositories/delete`, {
    username,
    repositoryName,
  });
}

async function addSshKey(username: string, key: string): Promise<any> {
  return await axios.post(`${config.gitServer.url}/api/key`, { username, key });
}

async function updateSshKey(username: string, oldKey: string, key: string): Promise<any> {
  return await axios.put(`${config.gitServer.url}/api/key`, {
    username,
    oldKey,
    key,
  });
}

async function removeSshKey(username: string, key: string): Promise<any> {
  return await axios.put(`${config.gitServer.url}/api/key/delete`, {
    username,
    key,
  });
}

async function getTree(username: string, repoName: string, branch: string, treePath: string) {
  try {
    const response = await axios.get(
      `${config.gitServer.url}/api/tree/${username}/${repoName}/${encodeURIComponent(branch)}/${encodeURIComponent(
        treePath
      )}`
    );
    return response.data;
  } catch (err) {
    throw new MissingEntityException("Folder not found");
  }
}

async function getCommits(username: string, repoName: string, branch: string) {
  try {
    const response = await axios.get(
      `${config.gitServer.url}/api/commits/${username}/${repoName}/${encodeURIComponent(branch)}`
    );
    return response.data;
  } catch (err) {
    throw new MissingEntityException("Commits not found");
  }
}

async function getCommit(username: string, repoName: string, sha: string) {
  try {
    const response = await axios.get(
      `${config.gitServer.url}/api/commit/${username}/${repoName}/${encodeURIComponent(sha)}`
    );
    return response.data;
  } catch (err) {
    throw new MissingEntityException("Commit not found");
  }
}

async function getBlob(username: string, repoName: string, branch: string, blobPath: string) {
  try {
    const response = await axios.get(
      `${config.gitServer.url}/api/blob/${username}/${repoName}/${encodeURIComponent(branch)}/${encodeURIComponent(
        blobPath
      )}`,
      { responseType: "arraybuffer" }
    );
    return {
      size: response.headers["size"] + "",
      bin: response.headers["bin"] + "",
      data: response.data,
    };
  } catch (err) {
    throw new MissingEntityException("File not found");
  }
}

export type GitServerClient = GitServerBranchesClient & {
  createUser(username: string): Promise<any>;
  createRepository(username: string, repositoryName: string): Promise<any>;
  deleteRepository(username: string, repositoryName: string): Promise<any>;
  addSshKey(username: string, key: string): Promise<any>;
  updateSshKey(username: string, oldKey: string, key: string): Promise<any>;
  removeSshKey(username: string, key: string): Promise<any>;
  getTree(username: string, repoName: string, branch: string, treePath: string): Promise<any>;
  getCommits(username: string, repoName: string, branch: string): Promise<any>;
  getCommit(username: string, repoName: string, sha: string): Promise<any>;
  getBlob(
    username: string,
    repoName: string,
    branch: string,
    blobPath: string
  ): Promise<{ size: string; bin: string; data: any }>;
};

const gitServerClient: GitServerCollaboratorsClient & GitServerClient = {
  createUser,
  createRepository,
  deleteRepository,
  addSshKey,
  updateSshKey,
  removeSshKey,
  getTree,
  getBlob,
  getCommits,
  getCommit,
  ...gitServerCollaboratorsClient,
  ...gitServerBranchesClient,
};

export { gitServerClient };
