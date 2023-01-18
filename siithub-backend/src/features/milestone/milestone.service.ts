import { type BaseEvent } from "../../db/base.repo.utils";
import { DuplicateException, MissingEntityException } from "../../error-handling/errors";
import type { MilestoneAssignedEvent, MilestoneUnassignedEvent } from "../issue/issue.model";
import { type Repository } from "../repository/repository.model";
import { repositoryService } from "../repository/repository.service";
import type { Milestone, MilestoneCreate, MilestoneUpdate } from "./milestone.model";
import { milestoneRepo } from "./milestone.repo";

const eventTypes = [
  "IssueReopenedEvent",
  "IssueClosedEvent",
  "MilestoneUnassignedEvent",
  "MilestoneAssignedEvent",
] as const;

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
  milestone.issuesInfo = { open: 0, closed: 0, lastUpdated: new Date() };
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

async function handleIssueEvent(id: Milestone["_id"], event: BaseEvent, isOpen: boolean) {
  if (!(eventTypes as ReadonlyArray<string>).includes(event.type)) return;
  if (event.type === eventTypes[2] && (event as MilestoneUnassignedEvent).milestoneId + "" !== id + "") return;
  if (event.type === eventTypes[3] && (event as MilestoneAssignedEvent).milestoneId + "" !== id + "") return;

  const milestone = await findOne(id);
  if (!milestone) return;
  const issuesInfo = milestone.issuesInfo ?? { open: 0, closed: 0, lastUpdated: new Date() };

  switch (event.type) {
    case eventTypes[0]:
      issuesInfo.closed--;
      issuesInfo.open++;
      break;
    case eventTypes[1]:
      issuesInfo.closed++;
      issuesInfo.open--;
      break;
    case eventTypes[2]:
      if (isOpen) issuesInfo.open--;
      else issuesInfo.closed--;
      break;
    case eventTypes[3]:
      if (isOpen) issuesInfo.open++;
      else issuesInfo.closed++;
      break;
  }
  issuesInfo.lastUpdated = new Date();

  await milestoneRepo.crud.update(id, { issuesInfo } as MilestoneUpdate);
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
  handleIssueEvent(id: Milestone["_id"], event: BaseEvent, isOpen: boolean): Promise<void>;
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
  handleIssueEvent,
};

export { milestoneService };
