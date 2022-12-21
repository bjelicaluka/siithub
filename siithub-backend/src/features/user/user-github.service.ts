import { BadLogicException, DuplicateException } from "../../error-handling/errors";
import type { GithubAccount, User } from "./user.model";
import { userRepo } from "./user.repo";
import { userService } from "./user.service";

async function findByGithubUsername(username: string): Promise<User | null> {
  return userRepo.findByGithubUsername(username);
}

async function updateGithubAccount(id: User['_id'], githubAccount: GithubAccount): Promise<User | null> {

  const existingUser = await userService.findOneOrThrow(id);
  const existingByGithubUsername = await findByGithubUsername(githubAccount.username);
  if (existingByGithubUsername) {
    throw new DuplicateException("Github username is already taken.");
  }

  existingUser.githubAccount = githubAccount;

  return await userRepo.crud.update(id, existingUser);
}

async function deleteGithubAccount(id: User['_id']): Promise<User | null> {

  const existingUser = await userService.findOneOrThrow(id);
  if (!existingUser.githubAccount?.username) {
    throw new BadLogicException("Github username is not set.");
  }

  existingUser.githubAccount = undefined;

  return await userRepo.crud.update(id, existingUser);
}

export type UserGithubService = {
  findByGithubUsername(username: string): Promise<User | null>,
  update(id: User['_id'], githubAccount: GithubAccount): Promise<User | null>,
  delete(id: User['_id']): Promise<User | null>,
}


const userGithubService: UserGithubService = {
  findByGithubUsername,
  update: updateGithubAccount,
  delete: deleteGithubAccount
}

export { userGithubService };