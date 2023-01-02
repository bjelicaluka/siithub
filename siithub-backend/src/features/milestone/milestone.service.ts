import { DuplicateException, MissingEntityException } from "../../error-handling/errors";
import { type Repository } from "../repository/repository.model";
import { repositoryService } from "../repository/repository.service";
import type { Milestone, MilestoneCreate, MilestoneUpdate } from "./milestone.model";
import { milestoneRepo } from "./milestone.repo";

async function findOne(id: Milestone["_id"]): Promise<Milestone | null> {
  return await milestoneRepo.crud.findOne(id);
}

async function findByRepositoryId(repositoryId: Repository["_id"], isOpen = true): Promise<Milestone[]> {
  return await milestoneRepo.findByRepositoryId(repositoryId, isOpen);
}

async function findByRepositoryIdAndLocalId(repositoryId: Repository["_id"], localId: number): Promise<Milestone> {
  const milestone = await milestoneRepo.findByRepositoryIdAndLocalId(repositoryId, localId);
  if (!milestone) {
    throw new MissingEntityException("Milestone with given id does not exist.");
  }
  return milestone;
}

async function findByTitleAndRepositoryId(title: string, repositoryId: Repository["_id"]): Promise<Milestone | null> {
  return await milestoneRepo.findByTitleAndRepositoryId(title, repositoryId);
}

async function findOneOrThrow(id: Milestone["_id"]): Promise<Milestone> {
  const milestone = await findOne(id);
  if (!milestone) {
    throw new MissingEntityException("Milestone with given id does not exist.");
  }
  return milestone;
}

async function searchByTitle(title: string, repositoryId: Repository["_id"]): Promise<Milestone[] | null> {
  return await milestoneRepo.searchByTitle(title, repositoryId);
}

async function createMilestone(milestone: MilestoneCreate): Promise<Milestone | null> {
  const milestoneWithSameName = await findByTitleAndRepositoryId(milestone.title, milestone.repositoryId);
  if (milestoneWithSameName) {
    throw new DuplicateException("Milestone with same title already exists.", milestone);
  }
  milestone.isOpen = true;
  milestone.localId = await repositoryService.increaseCounterValue(milestone.repositoryId, "milestone");
  return await milestoneRepo.crud.add(milestone);
}

async function updateMilestone(milestone: MilestoneUpdate): Promise<Milestone | null> {
  const existingMilestone = await findByRepositoryIdAndLocalId(milestone.repositoryId, milestone.localId);

  const milestoneWithSameName = await findByTitleAndRepositoryId(milestone.title, milestone.repositoryId);
  if (milestoneWithSameName && milestoneWithSameName._id + "" !== existingMilestone._id + "") {
    throw new DuplicateException("Milestone with same title already exists.", milestone);
  }

  existingMilestone.dueDate = milestone.dueDate;
  existingMilestone.description = milestone.description;
  existingMilestone.title = milestone.title;

  return await milestoneRepo.crud.update(existingMilestone._id, existingMilestone);
}

async function deleteMilestone(repositoryId: Repository["_id"], localId: number): Promise<Milestone | null> {
  const existingMilestone = await findByRepositoryIdAndLocalId(repositoryId, localId);
  return await milestoneRepo.crud.delete(existingMilestone._id);
}

async function changeStatus(
  repositoryId: Repository["_id"],
  localId: number,
  open: boolean
): Promise<Milestone | null> {
  const existingMilestone = await findByRepositoryIdAndLocalId(repositoryId, localId);
  return await milestoneRepo.crud.update(existingMilestone._id, { isOpen: open } as MilestoneUpdate);
}

export type MilestoneService = {
  create(Milestone: MilestoneCreate): Promise<Milestone | null>;
  update(Milestone: MilestoneUpdate): Promise<Milestone | null>;
  delete(repositoryId: Repository["_id"], localId: number): Promise<Milestone | null>;
  findOne(id: Milestone["_id"]): Promise<Milestone | null>;
  findOneOrThrow(id: Milestone["_id"]): Promise<Milestone>;
  findByRepositoryId(repositoryId: Repository["_id"], isOpen?: boolean): Promise<Milestone[]>;
  findByTitleAndRepositoryId(title: string, repositoryId: Repository["_id"]): Promise<Milestone | null>;
  searchByTitle(title: string, repositoryId: Repository["_id"]): Promise<Milestone[] | null>;
  changeStatus(repositoryId: Repository["_id"], localId: number, open: boolean): Promise<Milestone | null>;
  findByRepositoryIdAndLocalId(repositoryId: Repository["_id"], localId: number): Promise<Milestone>;
};

const milestoneService: MilestoneService = {
  findOne,
  findOneOrThrow,
  findByRepositoryId,
  findByTitleAndRepositoryId,
  searchByTitle,
  changeStatus,
  create: createMilestone,
  update: updateMilestone,
  delete: deleteMilestone,
  findByRepositoryIdAndLocalId,
};

export { milestoneService };
