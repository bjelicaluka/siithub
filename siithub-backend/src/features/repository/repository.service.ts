import {
  BadLogicException,
  DuplicateException,
  MissingEntityException,
} from "../../error-handling/errors";
import { gitServerClient } from "../gitserver/gitserver.client";
import { userService } from "../user/user.service";
import type {
  Repository,
  RepositoryCreate,
  RepositoryUpdate,
} from "./repository.model";
import { repositoryRepo } from "./repository.repo";

async function findOneOrThrow(id: Repository["_id"]): Promise<Repository> {
  const repository = await repositoryRepo.crud.findOne(id);
  if (!repository) {
    throw new MissingEntityException(
      "Repository with given id does not exist."
    );
  }
  return repository;
}

async function createRepository(
  repository: RepositoryCreate
): Promise<Repository | null> {
  const repositoriesWithSameName = await findByOwnerAndName(
    repository.owner,
    repository.name
  );
  if (repositoriesWithSameName) {
    throw new DuplicateException(
      "Repository with same name already exists.",
      repository
    );
  }

  const existingUser = await userService.findByUsername(repository.owner);
  if (!existingUser) {
    throw new MissingEntityException("User does not exist.", repository.owner);
  }

  try {
    await gitServerClient.createRepository(
      existingUser.username,
      repository.name
    );
  } catch (error) {
    throw new BadLogicException(
      "Failed to create repository in the file system."
    );
  }

  return await repositoryRepo.crud.add(repository);
}

async function findByOwnerAndName(
  owner: string,
  name: string
): Promise<Repository | null> {
  return await repositoryRepo.findByOwnerAndName(owner, name);
}

async function search(owner: string, term: string): Promise<Repository[]> {
  return await repositoryRepo.crud.findMany({
    owner,
    ...(term !== undefined ? { name: { $regex: term, $options: "i" } } : {}),
  });
}

async function getNextCounterValue(
  id: Repository["_id"],
  thing: "milestone" | "issue"
): Promise<number> {
  const repo = await findOneOrThrow(id);
  const counters = repo.counters ?? { [thing]: 0 };
  counters[thing] = counters[thing] + 1 || 1;
  await repositoryRepo.crud.update(id, { counters } as RepositoryUpdate);
  return counters[thing];
}

export type RepositoryService = {
  findOneOrThrow(id: Repository["_id"]): Promise<Repository>;
  create(repository: RepositoryCreate): Promise<Repository | null>;
  findByOwnerAndName(owner: string, name: string): Promise<Repository | null>;
  getNextCounterValue(
    id: Repository["_id"],
    thing: "milestone" | "issue"
  ): Promise<number>;
  search(owner: string, term?: string): Promise<Repository[]>;
};

const repositoryService: RepositoryService = {
  findOneOrThrow,
  create: createRepository,
  findByOwnerAndName,
  getNextCounterValue,
  search,
};

export { repositoryService };
