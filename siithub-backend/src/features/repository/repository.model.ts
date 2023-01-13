import { type BaseEntity } from "../../db/base.repo.utils";

export type Repository = {
  name: string;
  description?: string;
  type: "public" | "private";
  owner: string;
  counters: {
    [thing: string]: number;
  };
} & BaseEntity;

export type RepositoryCreate = Omit<Repository, "_id" | "counters">;
export type RepositoryUpdate = Repository;
