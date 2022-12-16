import { DuplicateException, MissingEntityException } from "../../error-handling/errors";
import { UserType, type User, type UserCreate } from "./user.model";
import { userRepo } from "./user.repo";
import { clearPropertiesOfResultWrapper } from "../../utils/wrappers";
import { getRandomString, getSha256Hash } from "../../utils/crypto";
import { gitServerClient } from "../gitserver/gitserver.client";

async function findOneOrThrow(id: User['_id'] | string): Promise<User> {
  const existingUser = await userRepo.crud.findOne(id);
  if (!existingUser) {
    throw new MissingEntityException("User with given id does not exist.");
  }

  return existingUser as User;
}

async function findByUsername(username: string): Promise<User | null> {
  return userRepo.findByUsername(username);
}

async function findByGithubUsername(username: string): Promise<User | null> {
  return userRepo.findByGithubUsername(username);
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

  if (user.githubUsername) {
    const userWithSameGithubUsername = await userRepo.findByGithubUsername(user.githubUsername);
    if (userWithSameGithubUsername) {
      throw new DuplicateException("Github username is already taken.", user);
    } else {
      user.githubAccount = { username: user.githubUsername };
    }
  }

  user.type = UserType.Developer;
  user.passwordAccount = getHashedPassword(user.password);

  await gitServerClient.createUser(user.username);

  return await userRepo.crud.add(user);
}

export type UserService = {
  findOneOrThrow(id: User['_id'] | string): Promise<User>,
  findByUsername(username: string): Promise<User | null>,
  findByGithubUsername(username: string): Promise<User | null>,
  create(user: UserCreate): Promise<User | null>
}

const userService: UserService = {
  findOneOrThrow,
  findByUsername,
  findByGithubUsername,
  create: removePassword(createUser)
}

export { userService };