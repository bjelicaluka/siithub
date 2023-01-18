import { type BaseEntity } from "../../db/base.repo.utils";
import { type Repository } from "../repository/repository.model";

export type Milestone = {
  title: string;
  localId: number;
  description: string;
  dueDate?: Date;
  repositoryId: Repository["_id"];
  isOpen: boolean;
  issuesInfo: {
    open: number;
    closed: number;
    lastUpdated: Date;
  };
} & BaseEntity;

export type MilestoneCreate = Omit<Milestone, "_id">;
export type MilestoneUpdate = Milestone;
