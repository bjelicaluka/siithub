import axios from "axios";

async function createUser(username: string): Promise<any> {

  const gitServerUrl = process.env.GITSERVER_HOST + ':' + process.env.GITSERVER_PORT;
  return await axios.post(`${gitServerUrl}/api/user`, { username });
}

export type GitServerClient = {
  createUser(username: string): Promise<any>
}

const gitServerClient: GitServerClient = {
  createUser
}

export { gitServerClient };