import { type BaseRepo, BaseRepoFactory } from "../../db/base.repo.utils";
import { type Issue } from "./issue.model";

const collectionName = "issue";

async function findByRepositoryId(repositoryId: string): Promise<Issue[]> {
  return (await issueRepo.crud.findManyCursor({ repositoryId })).toArray();
};

export type IssueRepo = {
  crud: BaseRepo<Issue>,
  findByRepositoryId(repositoryId: string): Promise<Issue[]>
};

const issueRepo: IssueRepo = {
  crud: BaseRepoFactory<Issue>(collectionName),
  findByRepositoryId
};

export { issueRepo };