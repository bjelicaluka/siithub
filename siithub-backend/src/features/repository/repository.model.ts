import { type BaseEntity } from "../../db/base.repo.utils"

export type Repository = {
  name: string,
  description?: string,
  owner: string
} & BaseEntity;

export type RepositoryCreate = Omit<Repository, "_id">;
export type RepositoryUpdate = Repository;

