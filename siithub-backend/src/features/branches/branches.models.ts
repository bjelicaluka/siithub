import { type BaseEntity } from "../../db/base.repo.utils";
import { type Repository } from "../repository/repository.model";

type Branch = string;

type DefaultBranch = BaseEntity & {
  repositoryId: Repository["_id"];
  branch: Branch;
};

export type { Branch, DefaultBranch };
