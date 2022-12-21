import axios from "axios";

const gitServerUrl =
  process.env.GITSERVER_HOST + ":" + process.env.GITSERVER_PORT;

async function createUser(username: string): Promise<any> {
  return await axios.post(`${gitServerUrl}/api/users`, { username });
}

async function createRepository(
  username: string,
  repositoryName: string
): Promise<any> {
  return await axios.post(`${gitServerUrl}/api/repositories`, {
    username,
    repositoryName,
  });
}

export type GitServerClient = {
  createUser(username: string): Promise<any>;
  createRepository(username: string, repositoryName: string): Promise<any>;
};

const gitServerClient: GitServerClient = {
  createUser,
  createRepository,
};

export { gitServerClient };
