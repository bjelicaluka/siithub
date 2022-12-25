import { type BaseRepo, BaseRepoFactory } from "../../db/base.repo.utils";
import {
  type SshKey,
  type SshKeyCreate,
  type SshKeyUpdate,
} from "./ssh-key.model";

const collectionName = "sshKey";

export type SshKeyRepo = {
  crud: BaseRepo<SshKey, SshKeyCreate, SshKeyUpdate>;
};

const sshKeyRepo: SshKeyRepo = {
  crud: BaseRepoFactory<SshKey, SshKeyCreate, SshKeyUpdate>(collectionName),
};

export { sshKeyRepo };
