import { BaseRepo, BaseRepoFactory } from "../../db/base.repo.utils";
import { type Repository } from "../repository/repository.model";
import { type User } from "../user/user.model";
import type { Collaborator, CollaboratorAdd } from "./collaborators.model";

const collectionName = "collaborators";

async function findByRepository(repositoryId: Repository["_id"]): Promise<Collaborator[]> {
  return await collaboratorsRepo.crud.findMany({ repositoryId });
}

async function findByRepositoryAndUser(
  repositoryId: Repository["_id"],
  userId: User["_id"]
): Promise<Collaborator | null> {
  return (await collaboratorsRepo.crud.findManyCursor({ repositoryId, userId })).next();
}

export type CollaboratorsRepo = {
  crud: BaseRepo<Collaborator, CollaboratorAdd>;
  findByRepository(repositoryId: Repository["_id"]): Promise<Collaborator[]>;

  findByRepositoryAndUser(
    repositoryId: Repository["_id"],
    userId: User["_id"]
  ): Promise<Collaborator | null>;
};

const collaboratorsRepo: CollaboratorsRepo = {
  crud: BaseRepoFactory<Collaborator, CollaboratorAdd>(collectionName),
  findByRepository,
  findByRepositoryAndUser,
};

export { collaboratorsRepo };
