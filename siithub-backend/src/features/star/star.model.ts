import { type BaseEntity } from "../../db/base.repo.utils";
import { type Repository } from "../repository/repository.model";
import { type User } from "../user/user.model";

export type Star = BaseEntity & {
  userId: User["_id"];
  repoId: Repository["_id"];
  date: Date;
};

export type StarCreate = Omit<Star, "_id">;
