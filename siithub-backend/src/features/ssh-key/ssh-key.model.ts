import { type BaseEntity } from "../../db/base.repo.utils";

export type SshKey = {
  name: string;
  value: string;
  owner: string;
} & BaseEntity;

export type SshKeyCreate = Omit<SshKey, "_id">;
export type SshKeyUpdate = SshKey;
