import axios, { AxiosResponse } from "axios";
import { config } from "../../config";

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

async function getTree(username: string, repoName: string, branch: string, treePath: string): Promise<any> {
  return (
    await axios.get(
      `${config.gitServer.url}/api/tree/${username}/${repoName}/${encodeURIComponent(branch)}/${encodeURIComponent(
        treePath
      )}`
    )
  ).data;
}

async function getBlob(username: string, repoName: string, branch: string, blobPath: string) {
  return await axios.get(
    `${config.gitServer.url}/api/blob/${username}/${repoName}/${encodeURIComponent(branch)}/${encodeURIComponent(
      blobPath
    )}`,
    { responseType: "arraybuffer" }
  );
}

export type GitServerClient = {
  createUser(username: string): Promise<any>;
  createRepository(username: string, repositoryName: string): Promise<any>;
  deleteRepository(username: string, repositoryName: string): Promise<any>;
  addSshKey(username: string, key: string): Promise<any>;
  updateSshKey(username: string, oldKey: string, key: string): Promise<any>;
  removeSshKey(username: string, key: string): Promise<any>;
  getTree(username: string, repoName: string, branch: string, treePath: string): Promise<any>;
  getBlob(username: string, repoName: string, branch: string, blobPath: string): Promise<AxiosResponse<any, any>>;
};

const gitServerClient: GitServerClient = {
  createUser,
  createRepository,
  deleteRepository,
  addSshKey,
  updateSshKey,
  removeSshKey,
  getTree,
  getBlob,
};

export { gitServerClient };
