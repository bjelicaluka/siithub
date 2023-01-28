import { type Branch, type DefaultBranch } from "./branches.models";
import { type Repository } from "../repository/repository.model";
import { defaultBranchRepo } from "./default-branch.repo";
import { branchesService } from "./branches.service";
import { repositoryService } from "../repository/repository.service";
import { BadLogicException, MissingEntityException } from "../../error-handling/errors";

async function findByRepository(owner: string, repoName: string): Promise<DefaultBranch | null> {
  return await findOrCreateIfNotExists(owner, repoName);
}

async function changeDefaultBranch(owner: string, repoName: string, defaultBranch: Branch): Promise<DefaultBranch> {
  await branchesService.findOneOrThrow(owner, repoName, defaultBranch);

  const existingDefaultBranch = await findOrCreateIfNotExists(owner, repoName);
  existingDefaultBranch.branch = defaultBranch;

  return (await defaultBranchRepo.crud.update(existingDefaultBranch._id, existingDefaultBranch)) as DefaultBranch;
}

async function findOrCreateIfNotExists(owner: string, repoName: string): Promise<DefaultBranch> {
  const repository = (await repositoryService.findByOwnerAndName(owner, repoName)) as Repository;
  if (!repository) throw new MissingEntityException("Given repository does not exist.");

  const allBranches = await branchesService.findMany(owner, repoName);
  if (allBranches.length === 0) throw new BadLogicException("Given repository is empty.");

  const existingDefaultBranch = await defaultBranchRepo.findByRepository(repository._id);
  if (existingDefaultBranch) return existingDefaultBranch;

  const branchName = ["main", "master", "develop"].find((b) => allBranches.includes(b));

  return (await defaultBranchRepo.crud.add({
    repositoryId: repository._id,
    branch: branchName ?? allBranches[0],
  })) as DefaultBranch;
}

export type DefaultBranchService = {
  findByRepository(owner: string, repoName: string): Promise<DefaultBranch | null>;
  change(owner: string, repoName: string, defaultBranch: Branch): Promise<DefaultBranch>;
};

const defaultBranchService: DefaultBranchService = {
  findByRepository,
  change: changeDefaultBranch,
};

export { defaultBranchService };
