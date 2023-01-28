import { type BaseEntity } from "../../db/base.repo.utils";
import { type Repository } from "../repository/repository.model";
import { type User } from "../user/user.model";

type Tag = BaseEntity & {
  name: string;
  description: string;
  version: string;
  commitSha: string;
  repositoryId: Repository["_id"];
  author: User["_id"];
  timeStamp: Date;
  branch: string;
  isLatest: boolean;
  isPreRelease: boolean;
};

type TagCreate = Omit<Tag, "_id" | "commitSha">;

type TagWithRepository = Tag & {
  repository: Repository;
  user: User;
};

export type { Tag, TagCreate, TagWithRepository };
