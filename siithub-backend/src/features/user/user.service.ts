import { DuplicateException } from "../../error-handling/errors";
import { UserType, type User, type UserCreate } from "./user.model";
import { userRepo } from "./user.repo";
import { clearPropertiesOfResultWrapper } from "../../utils/wrappers";
import { getRandomString, getSha256Hash } from "../../utils/crypto";

async function findByUsername(username: string): Promise<User | null> {
  return userRepo.findByUsername(username);
}

function removePassword(f: any) {
  return clearPropertiesOfResultWrapper(f, 'password', 'passwordAccount');
}  

function getHashedPassword(password: string): any {
  const salt = getRandomString(16);
  const passwordHash = getSha256Hash(password + salt);

  return { salt, passwordHash }
}

async function createUser(user: UserCreate): Promise<User | null> {

  const userWithSameUsername = await userRepo.findByUsername(user.username);
  if (userWithSameUsername) {
    throw new DuplicateException("Username is already taken.", user);
  }

  user.type = UserType.Developer;
  user.passwordAccount = getHashedPassword(user.password)

  return await userRepo.crud.add(user);
}

export type UserService = {
  findByUsername(username: string): Promise<User | null>,
  create(user: UserCreate): Promise<User | null>
}

const userService: UserService = {
  findByUsername,
  create: removePassword(createUser)
}

export { userService };