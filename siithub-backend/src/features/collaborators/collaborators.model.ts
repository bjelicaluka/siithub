import { type BaseEntity } from "../../db/base.repo.utils";
import { type Repository } from "../repository/repository.model";
import { type User } from "../user/user.model";

export type Collaborator = {
  userId: User["_id"];
  repositoryId: Repository["_id"];
} & BaseEntity;

export type CollaboratorAdd = Omit<Collaborator, "_id">;
export type CollaboratorRemove = CollaboratorAdd;
