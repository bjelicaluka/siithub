import { type BaseEntity } from "../../db/base.repo.utils"
import { type Repository } from "../repository/repository.model";

export type Label = {
  name: string,
  description: string,
  color: string,
  repositoryId: Repository["_id"]
} & BaseEntity;

export type LabelCreate = Omit<Label, "_id">;
export type LabelUpdate = Label;

