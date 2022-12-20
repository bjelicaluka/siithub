import axios from "axios";

export type GithubAccount = {
  "id": number,
  "login": string
};

export type GithubAuth = {
  code: string,
  state: string
}

async function getGithubAccount(auth: GithubAuth): Promise<GithubAccount|null> {
  if (!auth.code) {
    return null;
  }

  const accessTokenRequestParams = {
    ...auth,
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_SECRET
  }
  
  const accessTokenResponse = await axios.post("https://github.com/login/oauth/access_token", undefined, { params: accessTokenRequestParams });
  if (accessTokenResponse.data.startsWith("error")) {
    return null;
  }

  const accessTokenObj = new URLSearchParams(accessTokenResponse.data);
  const getAccountResponse = await axios.get("https://api.github.com/user", { headers: {
    'Authorization': accessTokenObj.get('token_type') + ' ' + accessTokenObj.get('access_token') 
  } });
  if (getAccountResponse.status !== 200) {
    return null;
  }

  return getAccountResponse.data;
}

export type GithubClient = {
  getGithubAccount(auth: GithubAuth): Promise<GithubAccount|null>
}

const githubClient: GithubClient = {
  getGithubAccount
};

export { githubClient };