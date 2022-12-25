import { AuthenticationException, MissingEntityException } from "../../error-handling/errors";
import { generateJWT } from "../../utils/jwt";
import { userService } from "../user/user.service";
import { type AuthenticatedUser } from "./auth.model";
import { removePassword } from "./auth.utils";
import { type GithubAuth, githubClient } from "./github.client";

async function authenticate(auth: GithubAuth): Promise<AuthenticatedUser | null> {
  
  const githubAccount = await githubClient.getGithubAccount(auth);
  if (!githubAccount) {
    throw new AuthenticationException("Error while trying to authorize to the GitHub.");
  }

  const user = await userService.findByGithubUsername(githubAccount.login);
  if (!user) {
    throw new MissingEntityException("Authorized GitHub account does not belong to any user account.", githubAccount);
  }
  
  return {
    user: removePassword(user),
    token: generateJWT({ 
      id: user['_id'],
      type: user.type
    })
  };
}

export type GithubAuthService = {
  authenticate(auth: GithubAuth): Promise<AuthenticatedUser | null>
}

const githubAuthService: GithubAuthService = {
  authenticate
};

export { githubAuthService };