import { DuplicateException, MissingEntityException } from "../../error-handling/errors";
import type { Label, LabelCreate, LabelUpdate } from "./label.model";
import { labelRepo } from "./label.repo";

async function findOne(id: Label["_id"] | string): Promise<Label | null> {
  return await labelRepo.crud.findOne(id);
}

async function findByRepositoryId(repositoryId: string): Promise<Label[]> {
  return await labelRepo.findByRepositoryId(repositoryId);
}

async function findByNameAndRepositoryId(name: string, repositoryId: string): Promise<Label | null> {
  return await labelRepo.findByNameAndRepositoryId(name, repositoryId);
}  

async function findOneOrThrow(id: Label["_id"] | string): Promise<Label> {
  const label = await labelRepo.crud.findOne(id);
  if (!label) {
    throw new MissingEntityException("Label with given id does not exist.");
  }
  return label as Label;
}

async function searchByName(name: string, repositoryId: string): Promise<Label[] | null> {
  return await labelRepo.searchByName(name, repositoryId);
}

async function createLabel(label: LabelCreate): Promise<Label | null> {
  const labelWithSameName = await labelRepo.findByNameAndRepositoryId(label.name, label.repositoryId);
  if (labelWithSameName) {
    throw new DuplicateException("Label with same name already exists.", label);
  }

  return await labelRepo.crud.add(label);
}

async function updateLabel(label: LabelUpdate): Promise<Label | null> {
  const existingLabel = await findOneOrThrow(label._id);

  const labelWithSameName = await labelRepo.findByNameAndRepositoryId(label.name, label.repositoryId);
  if (labelWithSameName && labelWithSameName._id + '' !== existingLabel._id + '') {
    throw new DuplicateException("Label with same name already exists.", label);
  }

  existingLabel.color = label.color;
  existingLabel.description = label.description;
  existingLabel.name = label.name;

  return await labelRepo.crud.update(label._id, existingLabel);
}

async function deleteLabel(id: Label['_id'] | string): Promise<Label | null> {
  const existingLabel = await findOneOrThrow(id);

  return await labelRepo.crud.delete(existingLabel._id);
}

export type LabelService = {
  create(label: LabelCreate): Promise<Label | null>,
  update(label: LabelUpdate): Promise<Label | null>,
  delete(id: Label['_id'] | string): Promise<Label | null>,
  findOne(id: Label['_id'] | string): Promise<Label | null>,
  findOneOrThrow(id: Label["_id"] | string): Promise<Label>,
  findByRepositoryId(repositoryId: string): Promise<Label[]>,
  findByNameAndRepositoryId(name: string, repositoryId: string): Promise<Label | null>,
  searchByName(name: string, repositoryId: string): Promise<Label[] | null>
}

const labelService: LabelService = {
  findOne,
  findOneOrThrow,
  findByRepositoryId,
  findByNameAndRepositoryId,
  searchByName,
  create: createLabel,
  update: updateLabel,
  delete: deleteLabel
}

export { labelService }