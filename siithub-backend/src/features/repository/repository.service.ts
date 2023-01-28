import {
  BadLogicException,
  DuplicateException,
  ForbiddenException,
  MissingEntityException,
} from "../../error-handling/errors";
import { asyncFilter } from "../../utils/filter";
import { collaboratorsService } from "../collaborators/collaborators.service";
import { gitServerClient } from "../gitserver/gitserver.client";
import { labelSeeder } from "../label/label.seeder";
import { type User } from "../user/user.model";
import { userService } from "../user/user.service";
import type { Repository, RepositoryCreate, RepositoryForkCreate, RepositoryUpdate } from "./repository.model";
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

async function createRepository(repository: RepositoryCreate): Promise<Repository> {
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

  await collaboratorsService.add({ repositoryId: repo._id, userId: existingUser._id }, false);

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

  if (repository.forkedFrom) await decreaseCounterValue(repository.forkedFrom, "forks");

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
  thing: "milestone" | "issue" | "stars" | "pull-request" | "forks"
): Promise<number> {
  const repo = await findOneOrThrow(id);
  const counters = repo.counters ?? { [thing]: 0 };
  counters[thing] = counters[thing] + 1 || 1;
  await repositoryRepo.crud.update(id, { counters } as RepositoryUpdate);
  return counters[thing];
}

async function decreaseCounterValue(id: Repository["_id"], thing: "stars" | "forks"): Promise<number> {
  const repo = await findOneOrThrow(id);
  const counters = repo.counters ?? { [thing]: 0 };
  counters[thing] = counters[thing] - 1 || 0;
  await repositoryRepo.crud.update(id, { counters } as RepositoryUpdate);
  return counters[thing];
}

async function findByIds(ids: Repository["_id"][], type?: "private" | "public"): Promise<Repository[]> {
  return await repositoryRepo.crud.findMany({ _id: { $in: ids }, ...(type ? { type } : {}) });
}

async function forkRepository(
  { repoName, repoOwner, name, description, only1Branch }: RepositoryForkCreate,
  userId: User["_id"]
): Promise<Repository> {
  const repo = await findByOwnerAndName(repoOwner, repoName);
  if (!repo) throw new MissingEntityException("Repository does not exist.");
  const user = await userService.findOneOrThrow(userId);
  if (repo.owner === user.username) throw new BadLogicException("You cannot fork your own repository.");
  const collab = await collaboratorsService.findByRepositoryAndUser(repo._id, userId);
  if (repo.type !== "public" && !collab) throw new ForbiddenException("You cannot fork this repository.");
  const existingFork = await findFork(user.username, repo._id);
  if (existingFork) throw new BadLogicException("You already have forked this repository.");
  const repoWithSameName = await findByOwnerAndName(user.username, name);
  if (repoWithSameName) throw new DuplicateException("Repository with same name already exists.");

  try {
    await gitServerClient.createRepositoryFork(user.username, name, repoOwner, repoName, repo.type, only1Branch);
  } catch (error) {
    throw new BadLogicException("Failed to create repository in the file system.");
  }

  const repoFork = await repositoryRepo.crud.add({
    owner: user.username,
    name,
    type: repo.type,
    description,
    forkedFrom: repo._id,
  });
  if (!repoFork) throw new BadLogicException("Failed to create repository.");

  await collaboratorsService.add({ repositoryId: repoFork._id, userId }, false);
  await labelSeeder.seedDefaultLabels(repoFork._id);
  await increaseCounterValue(repo._id, "forks");

  return repoFork;
}

async function findForks(forkedFrom: Repository["_id"]): Promise<Repository[]> {
  return await repositoryRepo.crud.findMany({ forkedFrom }, { projection: { owner: 1, name: 1 } });
}

async function findFork(owner: string, forkedFrom: Repository["_id"]): Promise<Repository | null> {
  return (await repositoryRepo.crud.findManyCursor({ owner, forkedFrom })).next();
}

async function resolveForkedFrom(repository: Repository): Promise<any> {
  if (!repository.forkedFrom) return repository;
  return {
    ...repository,
    forkedFromRepo: await repositoryRepo.crud.findOne(repository.forkedFrom),
  };
}

async function findAllByOwner(owner: string, myId: User["_id"]): Promise<Repository[]> {
  const me = await userService.findOneOrThrow(myId);
  const repos = await repositoryRepo.crud.findMany({ owner });
  if (me.username === owner) return repos;
  return await asyncFilter(repos, async (repo) => {
    if (repo.type === "public") return true;
    return !!(await collaboratorsService.findByRepositoryAndUser(repo._id, myId));
  });
}

export type RepositoryService = {
  findOneOrThrow(id: Repository["_id"]): Promise<Repository>;
  create(repository: RepositoryCreate): Promise<Repository>;
  delete(owner: string, name: string): Promise<Repository | null>;
  findByOwnerAndName(owner: string, name: string): Promise<Repository | null>;
  increaseCounterValue(
    id: Repository["_id"],
    thing: "milestone" | "issue" | "stars" | "pull-request" | "forks"
  ): Promise<number>;
  search(owner: string, term?: string): Promise<Repository[]>;
  decreaseCounterValue(id: Repository["_id"], thing: "stars" | "forks"): Promise<number>;
  findByIds(ids: Repository["_id"][], type?: "private" | "public"): Promise<Repository[]>;
  getRelevantRepos(userId: User["_id"]): Promise<Repository[]>;
  forkRepository(fork: RepositoryForkCreate, userId: User["_id"]): Promise<Repository>;
  findForks(forkedFrom: Repository["_id"]): Promise<Repository[]>;
  findFork(owner: string, forkedFrom: Repository["_id"]): Promise<Repository | null>;
  resolveForkedFrom(repository: Repository): Promise<any>;
  findAllByOwner(owner: string, myId: User["_id"]): Promise<Repository[]>;
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
  forkRepository,
  findForks,
  findFork,
  resolveForkedFrom,
  findAllByOwner,
};

export { repositoryService };
