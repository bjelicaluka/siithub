import axios from "axios";

async function create(username: string): Promise<any> {

  const gitServerUrl = process.env.GITSERVER_HOST + ':' + process.env.GITSERVER_PORT;
  return await axios.post(`${gitServerUrl}/api/create-user`, { username });
}

export type GitServerClient = {
  create(username: string): Promise<any>
}

const gitServerClient: GitServerClient = {
  create
}

export { gitServerClient };