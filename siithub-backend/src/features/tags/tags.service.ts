import { BadLogicException, DuplicateException, MissingEntityException } from "../../error-handling/errors";
import { branchesService } from "../branches/branches.service";
import { repositoryService } from "../repository/repository.service";
import { userService } from "../user/user.service";
import { tagsRepo } from "./tags.repo";
import { type Repository } from "../repository/repository.model";
import { type Tag, type TagCreate } from "./tags.model";
import { gitServerClient } from "../gitserver/gitserver.client";

async function findByVersionAndRepositoryId(version: string, repositoryId: Repository["_id"]): Promise<Tag | null> {
  return await tagsRepo.findByVersionAndRepositoryId(version, repositoryId);
}

async function findByVersionAndRepositoryIdOrThrow(version: string, repositoryId: Repository["_id"]): Promise<Tag> {
  const tag = await tagsRepo.findByVersionAndRepositoryId(version, repositoryId);
  if (!tag) {
    throw new MissingEntityException("Tag with given version does not exist in that repository.");
  }

  return tag as Tag;
}

async function findByRepositoryId(repositoryId: Repository["_id"]): Promise<Tag[]> {
  return await tagsRepo.findByRepositoryId(repositoryId);
}

async function searchByNameAndRepositoryId(name: string, repositoryId: Repository["_id"]): Promise<Tag[]> {
  return await tagsRepo.searchByNameAndRepositoryId(name, repositoryId);
}

async function countByRepositoryId(repositoryId: Repository["_id"]): Promise<number> {
  return await tagsRepo.countByRepositoryId(repositoryId);
}

async function createTag(createTag: TagCreate): Promise<Tag | null> {
  const tagWithSameVersion = await findByVersionAndRepositoryId(createTag.version, createTag.repositoryId);
  if (tagWithSameVersion) {
    throw new DuplicateException("Tag with same version already exists.", createTag);
  }

  const { owner, name } = await repositoryService.findOneOrThrow(createTag.repositoryId);
  await branchesService.findOneOrThrow(owner, name, createTag.branch);
  await userService.findOneOrThrow(createTag.author);

  const tag = createTag as Tag;
  const sha = await gitServerClient.getCommitsSha(owner, name, createTag.branch);
  if (!sha) {
    throw new BadLogicException("There is no branch with commits.");
  }

  tag.commitSha = sha ?? "";

  if (tag.isLatest) {
    const latestTag = await tagsRepo.findLatestByRepositoryId(createTag.repositoryId);
    if (latestTag) {
      latestTag.isLatest = false;
      await tagsRepo.crud.update(latestTag._id, latestTag);
    }
  }

  await gitServerClient.createTag(owner, name, createTag.version, createTag.branch);
  return await tagsRepo.crud.add(tag);
}

async function deleteTag(version: string, repositoryId: Repository["_id"]): Promise<Tag | null> {
  const tag = await findByVersionAndRepositoryIdOrThrow(version, repositoryId);

  const { owner, name } = await repositoryService.findOneOrThrow(tag.repositoryId);
  await gitServerClient.deleteTag(owner, name, tag.version);

  return await tagsRepo.crud.delete(tag._id);
}

export type TagsService = {
  findByRepositoryId(repositoryId: Repository["_id"]): Promise<Tag[]>;
  searchByNameAndRepositoryId(name: string, repositoryId: Repository["_id"]): Promise<Tag[]>;
  countByRepositoryId(repositoryId: Repository["_id"]): Promise<number>;
  create(tag: TagCreate): Promise<Tag | null>;
  delete(version: string, repositoryId: Repository["_id"]): Promise<Tag | null>;
};

const tagsService: TagsService = {
  findByRepositoryId,
  searchByNameAndRepositoryId,
  countByRepositoryId,
  create: createTag,
  delete: deleteTag,
};

export { tagsService };
