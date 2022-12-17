import { type BaseRepo, BaseRepoFactory } from "../../db/base.repo.utils";
import { type Label, type LabelCreate, type LabelUpdate } from "./label.model";

const collectionName = "label";

async function findByRepositoryId(repositoryId: string): Promise<Label[]> {
  return (await labelRepo.crud.findManyCursor({ repositoryId })).toArray();
}

async function findByNameAndRepositoryId(name: string, repositoryId: string): Promise<Label | null> {
  return (await labelRepo.crud.findManyCursor({ name, repositoryId })).next();
}

async function searchByName(name: string, repositoryId: string): Promise<Label[] | null> {
  return (await labelRepo.crud.findManyCursor({name: { $regex: name, $options: 'i' }, repositoryId })).toArray();
}

export type LabelRepo = {
  crud: BaseRepo<Label, LabelCreate, LabelUpdate>,
  findByRepositoryId(repositoryId: string): Promise<Label[]>,
  findByNameAndRepositoryId(name: string, repositoryId: string): Promise<Label | null>,
  searchByName(name: string, repositoryId: string): Promise<Label[] | null>
}

const labelRepo: LabelRepo = {
  crud: BaseRepoFactory<Label, LabelCreate, LabelUpdate>(collectionName),
  findByRepositoryId,
  findByNameAndRepositoryId,
  searchByName
};

export { labelRepo };