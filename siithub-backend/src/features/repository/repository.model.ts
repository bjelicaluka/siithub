import { type BaseEntity } from "../../db/base.repo.utils";

export type Repository = {
  name: string;
  description?: string;
  type: "public" | "private";
  owner: string;
  counters: {
    [thing: string]: number;
  };
  forkedFrom?: Repository["_id"];
} & BaseEntity;

export type RepositoryCreate = Omit<Repository, "_id" | "counters">;
export type RepositoryUpdate = Partial<Repository>;

export type RepositoryForkCreate = {
  name: string;
  description?: string;
  repoName: string;
  repoOwner: string;
  only1Branch?: string;
};
