import { AuthenticationException } from "../../error-handling/errors";
import { getSha256Hash } from "../../utils/crypto";
import { generateJWT } from "../../utils/jwt";
import { clearPropertiesOfObject } from "../../utils/wrappers";
import { type User } from "../user/user.model";
import { userService } from "../user/user.service";
import { type AuthenticatedUser, type Credentials } from "./auth.model";

function removePassword(user: User) {
  return clearPropertiesOfObject(user, 'passwordAccount');
}  

async function authenticate(credentials: Credentials): Promise<AuthenticatedUser | null> {
  const { username, password } = credentials;

  const userWithSameUsername = await userService.findByUsername(username);
  if (!userWithSameUsername) {
    throw new AuthenticationException("The combination of username and password does not match any existing account.");
  }
  const passwordHash = getSha256Hash(password + userWithSameUsername.passwordAccount?.salt);

  if (passwordHash !== userWithSameUsername.passwordAccount?.passwordHash) {
    throw new AuthenticationException("The combination of username and password does not match any existing account.");
  }
  
  return {
    user: removePassword(userWithSameUsername),
    token: generateJWT({ 
      id: userWithSameUsername['_id'],
      type: userWithSameUsername.type
    })
  };
}

export type AuthService = {
  authenticate(credentials: Credentials): Promise<AuthenticatedUser | null>
}

const authService: AuthService = {
  authenticate
};

export { authService };