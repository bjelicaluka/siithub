import axios from "axios";
import { config } from "../../config";

async function createUser(username: string): Promise<any> {
  return await axios.post(`${config.gitServer.url}/api/users`, { username });
}

async function createRepository(
  username: string,
  repositoryName: string
): Promise<any> {
  return await axios.post(`${config.gitServer.url}/api/repositories`, {
    username,
    repositoryName,
  });
}

async function addSshKey(username: string, key: string): Promise<any> {
  return await axios.post(`${config.gitServer.url}/api/key`, { username, key });
}

async function updateSshKey(
  username: string,
  oldKey: string,
  key: string
): Promise<any> {
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

export type GitServerClient = {
  createUser(username: string): Promise<any>;
  createRepository(username: string, repositoryName: string): Promise<any>;
  addSshKey(username: string, key: string): Promise<any>;
  updateSshKey(username: string, oldKey: string, key: string): Promise<any>;
  removeSshKey(username: string, key: string): Promise<any>;
};

const gitServerClient: GitServerClient = {
  createUser,
  createRepository,
  addSshKey,
  updateSshKey,
  removeSshKey,
};

export { gitServerClient };
