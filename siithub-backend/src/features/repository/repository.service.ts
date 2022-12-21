import {
  BadLogicException,
  DuplicateException,
  MissingEntityException,
} from "../../error-handling/errors";
import { gitServerClient } from "../gitserver/gitserver.client";
import { userService } from "../user/user.service";
import type { Repository, RepositoryCreate } from "./repository.model";
import { repositoryRepo } from "./repository.repo";

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
  create(repository: RepositoryCreate): Promise<Repository | null>;
};

const repositoryService: RepositoryService = {
  create: createRepository,
};

export { repositoryService };
