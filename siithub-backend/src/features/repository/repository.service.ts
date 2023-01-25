import { BadLogicException, DuplicateException, MissingEntityException } from "../../error-handling/errors";
import { collaboratorsService } from "../collaborators/collaborators.service";
import { gitServerClient } from "../gitserver/gitserver.client";
import { labelSeeder } from "../label/label.seeder";
import { type User } from "../user/user.model";
import { userService } from "../user/user.service";
import type { Repository, RepositoryCreate, RepositoryUpdate } from "./repository.model";
import { repositoryRepo } from "./repository.repo";

async function getRelevantRepos(userId: User["_id"]): Promise<Repository[]> {
  const collabs = await collaboratorsService.findByUser(userId);
  const repoIds: Repository["_id"][] = collabs.map((collab) => collab.repositoryId);

  return repositoryService.findByIds(repoIds);
}

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

  const repo = await repositoryRepo.crud.add(repository);
  if (!repo) throw new BadLogicException("Failed to create repository.");

  await collaboratorsService.add({
    repositoryId: repo._id,
    userId: existingUser._id,
  });

  await labelSeeder.seedDefaultLabels(repo._id);

  return repo;
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
  const user = await userService.findByUsername(owner);
  if (!user) throw new MissingEntityException("User not found");
  return (await getRelevantRepos(user._id)).filter((x) => !term || x.name.toLowerCase().includes(term.toLowerCase()));
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
  getRelevantRepos(userId: User["_id"]): Promise<Repository[]>;
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
  getRelevantRepos,
};

export { repositoryService };
