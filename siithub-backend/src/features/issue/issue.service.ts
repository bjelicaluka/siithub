import { Filter, FindOptions, ObjectId } from "mongodb";
import { type BaseEvent } from "../../db/base.repo.utils";
import { MissingEntityException } from "../../error-handling/errors";
import { labelService } from "../label/label.service";
import { userService } from "../user/user.service";
import {
  type IssueCreate,
  type Issue,
  type IssueUpdate,
  handleFor,
  type LabelAssignedEvent,
  type UserAssignedEvent,
  type MilestoneAssignedEvent,
} from "./issue.model";
import { issueRepo } from "./issue.repo";
import { type Repository } from "../repository/repository.model";
import { repositoryService } from "../repository/repository.service";
import { IssuesQuery } from "./issue.query";
import { milestoneService } from "../milestone/milestone.service";

async function findOne(id: Issue["_id"]): Promise<Issue | null> {
  return await issueRepo.crud.findOne(id);
}

async function findByRepositoryId(repositoryId: Repository["_id"]): Promise<Issue[]> {
  return await issueRepo.findByRepositoryId(repositoryId);
}

async function findMany(filters: Filter<Issue> = {}, options: FindOptions<Issue> = {}): Promise<Issue[]> {
  return await issueRepo.crud.findMany(filters, options);
}

async function searchByQuery(query: IssuesQuery, repositoryId: Repository["_id"]): Promise<Issue[]> {
  return await issueRepo.searchByQuery(query, repositoryId);
}

async function findOneOrThrow(id: Issue["_id"]): Promise<Issue> {
  const issue = await issueRepo.crud.findOne(id);
  if (!issue) {
    throw new MissingEntityException("Issue with given id does not exist.");
  }
  return issue as Issue;
}

async function createIssue({ events, repositoryId }: IssueCreate): Promise<Issue | null> {
  await repositoryService.findOneOrThrow(repositoryId);

  const createdIssue = (await issueRepo.crud.add({
    events: [],
    csm: {},
    repositoryId,
  })) as Issue;

  return await updateEventsFor(createdIssue, events);
}

async function updateIssue({ _id, events }: IssueUpdate): Promise<Issue | null> {
  const existingIssue = await findOneOrThrow(_id);

  return await updateEventsFor(existingIssue, events);
}

async function updateEventsFor(issue: Issue, events: BaseEvent[]) {
  for (const event of events) {
    await handleEvent(issue, event);
  }

  return await issueRepo.crud.update(issue._id, issue);
}

async function handleEvent(issue: Issue, event: BaseEvent): Promise<void> {
  await validateEventFor(event);

  event._id = new ObjectId();
  event.streamId = issue._id;
  event.timeStamp = new Date();

  handleFor(issue, event);
}

async function validateEventFor(event: BaseEvent): Promise<void> {
  switch (event.type) {
    case "LabelAssignedEvent": {
      const labelAssigned = event as LabelAssignedEvent;
      await labelService.findOneOrThrow(new ObjectId(labelAssigned?.labelId?.toString()));
      return;
    }

    case "MilestoneAssignedEvent": {
      const milestoneAssigned = event as MilestoneAssignedEvent;
      await milestoneService.findOneOrThrow(new ObjectId(milestoneAssigned?.milestoneId?.toString()));
      return;
    }

    case "UserAssignedEvent": {
      const userAssigned = event as UserAssignedEvent;
      await userService.findOneOrThrow(new ObjectId(userAssigned?.userId?.toString()));
      return;
    }
  }
}

export type IssueService = {
  findOne(id: Issue["_id"]): Promise<Issue | null>;
  findOneOrThrow(id: Issue["_id"]): Promise<Issue>;
  findByRepositoryId(repositoryId: Repository["_id"]): Promise<Issue[]>;
  findMany(filters?: Filter<Issue>, options?: FindOptions<Issue>): Promise<Issue[]>;
  searchByQuery(query: IssuesQuery, repositoryId: Repository["_id"]): Promise<Issue[]>;
  create(issue: IssueCreate): Promise<Issue | null>;
  update(issue: IssueUpdate): Promise<Issue | null>;
  validateEventFor(event: BaseEvent): Promise<void>;
};

const issueService: IssueService = {
  findOne,
  findOneOrThrow,
  findByRepositoryId,
  findMany,
  searchByQuery,
  create: createIssue,
  update: updateIssue,
  validateEventFor,
};

export { issueService, validateEventFor };
