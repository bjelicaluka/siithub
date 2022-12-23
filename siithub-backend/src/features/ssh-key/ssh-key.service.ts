import { type ObjectId } from "mongodb";
import {
  BadLogicException,
  DuplicateException,
  MissingEntityException,
} from "../../error-handling/errors";
import { gitServerClient } from "../gitserver/gitserver.client";
import { userService } from "../user/user.service";
import type { SshKey, SshKeyCreate, SshKeyUpdate } from "./ssh-key.model";
import { sshKeyRepo } from "./ssh-key.repo";

async function findOneOrThrow(id: SshKey["_id"]): Promise<SshKey> {
  const sshKey = await sshKeyRepo.crud.findOne(id);
  if (!sshKey) {
    throw new MissingEntityException("SshKey with given id does not exist.");
  }
  return sshKey as SshKey;
}

async function createSshKey(sshKey: SshKeyCreate): Promise<SshKey | null> {
  const sshKeysWithSameName = await sshKeyRepo.crud.findMany({
    name: sshKey.name,
    owner: sshKey.owner,
  });
  if (sshKeysWithSameName.length) {
    throw new DuplicateException(
      "SshKey with same name already exists.",
      sshKey
    );
  }

  const existingUser = await userService.findByUsername(sshKey.owner);
  if (!existingUser) {
    throw new MissingEntityException("User does not exist.", sshKey.owner);
  }

  try {
    await gitServerClient.addSshKey(existingUser.username, sshKey.value);
  } catch (error) {
    throw new BadLogicException("Failed to create sshKey in the file system.");
  }

  return await sshKeyRepo.crud.add(sshKey);
}

async function updateSshKey(
  keyId: string,
  sshKey: SshKeyUpdate
): Promise<SshKey | null> {
  const foundSshKey = await sshKeyRepo.crud.findOne(keyId);
  if (!foundSshKey) {
    throw new MissingEntityException("SshKey not found.", keyId);
  }

  const sshKeysWithSameName = await sshKeyRepo.crud.findMany({
    name: sshKey.name,
    owner: sshKey.owner,
  });
  if (sshKeysWithSameName.length) {
    throw new DuplicateException(
      "SshKey with same name already exists.",
      sshKey
    );
  }

  const existingUser = await userService.findByUsername(sshKey.owner);
  if (!existingUser) {
    throw new MissingEntityException("User does not exist.", sshKey.owner);
  }

  try {
    await gitServerClient.updateSshKey(
      existingUser.username,
      foundSshKey.value,
      sshKey.value
    );
  } catch (error) {
    throw new BadLogicException("Failed to create sshKey in the file system.");
  }

  return await sshKeyRepo.crud.update(keyId, sshKey);
}

async function deleteSshKey(keyId: string): Promise<SshKey | null> {
  const foundSshKey = await sshKeyRepo.crud.findOne(keyId);
  if (!foundSshKey) {
    throw new MissingEntityException("SshKey not found.", keyId);
  }

  const existingUser = await userService.findByUsername(foundSshKey.owner);
  if (!existingUser) {
    throw new MissingEntityException("User does not exist.", foundSshKey.owner);
  }

  try {
    await gitServerClient.removeSshKey(
      existingUser.username,
      foundSshKey.value
    );
  } catch (error) {
    throw new BadLogicException("Failed to create sshKey in the file system.");
  }

  return await sshKeyRepo.crud.delete(keyId);
}

export type SshKeyService = {
  findOneOrThrow(id: SshKey["_id"]): Promise<SshKey>;
  create(sshKey: SshKeyCreate): Promise<SshKey | null>;
  update(
    keyId: ObjectId | string,
    sshKey: SshKeyCreate
  ): Promise<SshKey | null>;
  delete(keyId: string): Promise<SshKey | null>;
};

const sshKeyService: SshKeyService = {
  findOneOrThrow,
  create: createSshKey,
  update: updateSshKey,
  delete: deleteSshKey,
};

export { sshKeyService };
