import { BadLogicException, DuplicateException, MissingEntityException } from "../../error-handling/errors";
import { UserType, type UserUpdate, type User, type UserCreate } from "./user.model";
import { userRepo } from "./user.repo";
import { clearPropertiesOfResultWrapper } from "../../utils/wrappers";
import { getRandomString, getSha256Hash } from "../../utils/crypto";
import { gitServerClient } from "../gitserver/gitserver.client";

async function findOneOrThrow(id: User['_id']): Promise<User> {
  const existingUser = await userRepo.crud.findOne(id);
  if (!existingUser) {
    throw new MissingEntityException("User with given id does not exist.");
  }
  return existingUser;
}

async function findMany(): Promise<User[]> {
  return await userRepo.crud.findMany();
}

async function findByUsername(username: string): Promise<User | null> {
  return await userRepo.findByUsername(username);
}

async function findByUsernameOrThrow(username: string): Promise<User> {
  const existingUser = await userRepo.findByUsername(username);
  if (!existingUser) {
    throw new MissingEntityException("User with given username does not exist.");
  }
  return existingUser;
}

async function findByGithubUsername(username: string): Promise<User | null> {
  return userRepo.findByGithubUsername(username);
}

function removePassword(f: any) {
  return clearPropertiesOfResultWrapper(f, 'password', 'passwordAccount');
}  

function getHashedPassword(password: string) {
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
  user.password = "";

  await gitServerClient.createUser(user.username);

  return await userRepo.crud.add(user);
}

async function updateProfile(id: User["_id"], profileUpdate: UserUpdate): Promise<User | null> {
  const user = await findOneOrThrow(id);
  const {name, bio, email} = profileUpdate;
  return await userRepo.crud.update(id, {name, bio, email});
}

async function updatePassword(id: User["_id"], passwordUpdate: {oldPassword: string, newPassword: string}): Promise<User | null> {
  const user = await findOneOrThrow(id);
  const passwordHash = getSha256Hash(passwordUpdate.oldPassword + user.passwordAccount?.salt);
  if (passwordHash !== user.passwordAccount?.passwordHash) {
    throw new BadLogicException("Old password is incorrect");
  }
  console.log(passwordUpdate.newPassword)
  return await userRepo.crud.update(id, {passwordAccount: getHashedPassword(passwordUpdate.newPassword)});
}

export type UserService = {
  findOneOrThrow(id: User['_id']): Promise<User>,
  findByUsername(username: string): Promise<User | null>,
  findByUsernameOrThrow(username: string): Promise<User>,
  findByGithubUsername(username: string): Promise<User | null>,
  findMany(): Promise<User[]>,
  create(user: UserCreate): Promise<User | null>
  updateProfile(id: User["_id"], profileUpdate: UserUpdate): Promise<User | null>,
  updatePassword(id: User["_id"], passwordUpdate: {oldPassword: string, newPassword: string}): Promise<User | null>
}

const userService: UserService = {
  findMany,
  findOneOrThrow: removePassword(findOneOrThrow),
  findByUsername,
  findByUsernameOrThrow: removePassword(findByUsernameOrThrow),
  findByGithubUsername: removePassword(findByGithubUsername),
  create: removePassword(createUser),
  updateProfile: removePassword(updateProfile),
  updatePassword: removePassword(updatePassword)
}

export { userService };