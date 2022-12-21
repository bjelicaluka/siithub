import {
  BadLogicException,
  DuplicateException,
  MissingEntityException,
} from "../../error-handling/errors";
import { gitServerClient } from "../gitserver/gitserver.client";
import { userService } from "../user/user.service";
import type { Repository, RepositoryCreate } from "./repository.model";
import { repositoryRepo } from "./repository.repo";


async function findOneOrThrow(id: Repository["_id"]): Promise<Repository> {
  const repository = await repositoryRepo.crud.findOne(id);
  if (!repository) {
    throw new MissingEntityException("Repository with given id does not exist.");
  }
  return repository as Repository;
}

async function createRepository(
  repository: RepositoryCreate
): Promise<Repository | null> {
  const repositoriesWithSameName = await repositoryRepo.crud.findMany({
    name: repository.name,
  });
  if (repositoriesWithSameName.length) {
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

export type RepositoryService = {
  findOneOrThrow(id: Repository["_id"]): Promise<Repository>,
  create(repository: RepositoryCreate): Promise<Repository | null>;
};

const repositoryService: RepositoryService = {
  findOneOrThrow,
  create: createRepository,
};

export { repositoryService };
