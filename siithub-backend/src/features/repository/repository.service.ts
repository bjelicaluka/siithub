import { BadLogicException, DuplicateException, MissingEntityException } from "../../error-handling/errors";
import { gitServerClient } from "../gitserver/gitserver.client";
import { userService } from "../user/user.service";
import type { Repository, RepositoryCreate, RepositoryUpdate } from "./repository.model";
import { repositoryRepo } from "./repository.repo";

async function findOneOrThrow(id: Repository["_id"]): Promise<Repository> {
  const repository = await repositoryRepo.crud.findOne(id);
  if (!repository) {
    throw new MissingEntityException("Repository with given id does not exist.");
  }
  return repository;
}

async function createRepository(repository: RepositoryCreate): Promise<Repository | null> {
  const repositoriesWithSameName = await findByOwnerAndName(repository.owner, repository.name);
  if (repositoriesWithSameName) {
    throw new DuplicateException("Repository with same name already exists.", repository);
  }

  const existingUser = await userService.findByUsername(repository.owner);
  if (!existingUser) {
    throw new MissingEntityException("User does not exist.", repository.owner);
  }

  try {
    await gitServerClient.createRepository(existingUser.username, repository.name, repository.type);
  } catch (error) {
    throw new BadLogicException("Failed to create repository in the file system.");
  }

  return await repositoryRepo.crud.add(repository);
}

async function deleteRepository(owner: string, name: string): Promise<Repository | null> {
  const repository = await findByOwnerAndName(owner, name);
  if (!repository) {
    throw new MissingEntityException("Repository does not exist.");
  }

  const existingUser = await userService.findByUsername(repository.owner);
  if (!existingUser) {
    throw new MissingEntityException("User does not exist.", repository.owner);
  }

  try {
    await gitServerClient.deleteRepository(existingUser.username, repository.name);
  } catch (error) {
    throw new BadLogicException("Failed to delete repository in the file system.");
  }

  return await repositoryRepo.crud.delete(repository._id);
}

async function findByOwnerAndName(owner: string, name: string): Promise<Repository | null> {
  return await repositoryRepo.findByOwnerAndName(owner, name);
}

async function search(owner: string, term: string): Promise<Repository[]> {
  return await repositoryRepo.crud.findMany({
    owner,
    ...(term !== undefined ? { name: { $regex: term, $options: "i" } } : {}),
  });
}

async function increaseCounterValue(
  id: Repository["_id"],
  thing: "milestone" | "issue" | "stars" | "pull-request"
): Promise<number> {
  const repo = await findOneOrThrow(id);
  const counters = repo.counters ?? { [thing]: 0 };
  counters[thing] = counters[thing] + 1 || 1;
  await repositoryRepo.crud.update(id, { counters } as RepositoryUpdate);
  return counters[thing];
}

async function decreaseCounterValue(id: Repository["_id"], thing: "stars"): Promise<number> {
  const repo = await findOneOrThrow(id);
  const counters = repo.counters ?? { [thing]: 0 };
  counters[thing] = counters[thing] - 1 || 0;
  await repositoryRepo.crud.update(id, { counters } as RepositoryUpdate);
  return counters[thing];
}

async function findByIds(ids: Repository["_id"][]): Promise<Repository[]> {
  return await repositoryRepo.crud.findMany({ _id: { $in: ids } });
}

export type RepositoryService = {
  findOneOrThrow(id: Repository["_id"]): Promise<Repository>;
  create(repository: RepositoryCreate): Promise<Repository | null>;
  delete(owner: string, name: string): Promise<Repository | null>;
  findByOwnerAndName(owner: string, name: string): Promise<Repository | null>;
  increaseCounterValue(id: Repository["_id"], thing: "milestone" | "issue" | "stars" | "pull-request"): Promise<number>;
  search(owner: string, term?: string): Promise<Repository[]>;
  findByIds(ids: Repository["_id"][]): Promise<Repository[]>;
  decreaseCounterValue(id: Repository["_id"], thing: "stars"): Promise<number>;
};

const repositoryService: RepositoryService = {
  findOneOrThrow,
  create: createRepository,
  delete: deleteRepository,
  findByOwnerAndName,
  increaseCounterValue,
  search,
  findByIds,
  decreaseCounterValue,
};

export { repositoryService };
