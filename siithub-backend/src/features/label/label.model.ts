import { type BaseEntity } from "../../db/base.repo.utils"

export type Label = {
  name: string,
  description: string,
  color: string,
  repositoryId: string
} & BaseEntity;

export type LabelCreate = Omit<Label, "_id">;
export type LabelUpdate = Label;

