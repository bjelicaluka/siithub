import { BadLogicException, MissingEntityException } from "../../error-handling/errors";
import { gitServerClient } from "../gitserver/gitserver.client";
import { type Branch } from "./branches.models";

async function findMany(username: string, repoName: string, name: string = ""): Promise<Branch[]> {
  return (await gitServerClient.getBranches(username, repoName)).filter((branch) =>
    branch.toLowerCase().includes(name.toLowerCase())
  );
}

async function findOne(username: string, repoName: string, branchName: string): Promise<Branch | null> {
  const branches = await findMany(username, repoName);
  return branches.find((branch: Branch) => branch === branchName) || null;
}

async function findOneOrThrow(username: string, repoName: string, branchName: string): Promise<Branch> {
  const branch = await findOne(username, repoName, branchName);
  if (!branch) {
    throw new MissingEntityException(`Branch ${branchName} does not exist.`);
  }
  return branch as Branch;
}

async function count(username: string, repoName: string): Promise<number> {
  return (await gitServerClient.getBranches(username, repoName)).length;
}

async function createBranch(username: string, repoName: string, source: string, branchName: string): Promise<Branch> {
  await findOneOrThrow(username, repoName, source);

  const existingBranch = await findOne(username, repoName, branchName);
  if (existingBranch) {
    throw new BadLogicException(`Branch ${branchName} already exist.`);
  }

  return await gitServerClient.createBranch(username, repoName, source, branchName);
}

async function renameBranch(
  username: string,
  repoName: string,
  branchName: string,
  newBranchName: string
): Promise<Branch> {
  await findOneOrThrow(username, repoName, branchName);

  const existingBranch = await findOne(username, repoName, newBranchName);
  if (existingBranch) {
    throw new BadLogicException(`Branch ${newBranchName} already exist.`);
  }

  return await gitServerClient.renameBranch(username, repoName, branchName, newBranchName);
}

async function removeBranch(username: string, repoName: string, branchName: string): Promise<Branch> {
  await findOneOrThrow(username, repoName, branchName);

  return await gitServerClient.removeBranch(username, repoName, branchName);
}

export type BranchesService = {
  findMany(username: string, repoName: string, name?: string): Promise<Branch[]>;
  findOne(username: string, repoName: string, branchName: string): Promise<Branch | null>;
  findOneOrThrow(username: string, repoName: string, branchName: string): Promise<Branch>;
  count(username: string, repoName: string): Promise<number>;
  create(username: string, repoName: string, source: string, branchName: string): Promise<Branch>;
  rename(username: string, repoName: string, branchName: string, newBranchName: string): Promise<Branch>;
  remove(username: string, repoName: string, branchName: string): Promise<Branch>;
};

const branchesService: BranchesService = {
  findMany,
  findOne,
  findOneOrThrow,
  count,
  create: createBranch,
  rename: renameBranch,
  remove: removeBranch,
};

export { branchesService };
