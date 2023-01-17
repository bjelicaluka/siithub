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
  IssueWithParticipants,
} from "./issue.model";
import { issueRepo } from "./issue.repo";
import { type Repository } from "../repository/repository.model";
import { repositoryService } from "../repository/repository.service";
import { IssuesQuery } from "./issue.query";
import { milestoneService } from "../milestone/milestone.service";
import { User } from "../user/user.model";

async function findOne(id: Issue["_id"]): Promise<Issue | null> {
  return await issueRepo.crud.findOne(id);
}

async function findByRepositoryId(repositoryId: Repository["_id"]): Promise<Issue[]> {
  return await issueRepo.findByRepositoryId(repositoryId);
}

async function findByRepositoryIdAndLocalId(repositoryId: Repository["_id"], localId: number): Promise<Issue> {
  const issue = await issueRepo.findByRepositoryIdAndLocalId(repositoryId, localId);
  if (!issue) {
    throw new MissingEntityException("Issue with given id does not exist.");
  }
  return issue;
}

async function findMany(filters: Filter<Issue> = {}, options: FindOptions<Issue> = {}): Promise<Issue[]> {
  return await issueRepo.crud.findMany(filters, options);
}

async function searchByQuery(query: IssuesQuery, repositoryId: Repository["_id"]): Promise<Issue[]> {
  query.state = query.state?.map((s) => +s);
  return await issueRepo.searchByQuery(query, repositoryId);
}

async function findOneOrThrow(id: Issue["_id"]): Promise<Issue> {
  const issue = await issueRepo.crud.findOne(id);
  if (!issue) {
    throw new MissingEntityException("Issue with given id does not exist.");
  }
  return issue;
}

async function createIssue({ events, repositoryId }: IssueCreate): Promise<Issue | null> {
  const localId = await repositoryService.increaseCounterValue(repositoryId, "issue");
  const createdIssue = (await issueRepo.crud.add({
    events: [],
    csm: {},
    repositoryId,
    localId,
  })) as Issue;

  return await updateEventsFor(createdIssue, events);
}

async function updateIssue({ repositoryId, localId, events }: IssueUpdate): Promise<Issue | null> {
  const existingIssue = await findByRepositoryIdAndLocalId(repositoryId, localId);

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
  event.by = new ObjectId(event.by?.toString());

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

async function resolveParticipants(issues: Issue[]): Promise<IssueWithParticipants[]> {
  let participantsIds: User["_id"][] = [];
  for (const issue of issues) {
    for (const event of issue.events) {
      participantsIds.push(event.by);
      if (event.type === "UserAssignedEvent") participantsIds.push((event as UserAssignedEvent).userId);
    }
  }
  const users = (
    await userService.findManyByIds(participantsIds.filter((value, index, array) => array.indexOf(value) === index))
  ).map((u) => ({ ...u, _id: u._id + "" }));
  return issues.map((issue) => {
    let participants: { [uid: string]: any } = {};
    for (const event of issue.events) {
      let userId = event.by + "";
      participants[event.by + ""] = users.find((u) => u._id === userId);
      if (event.type === "UserAssignedEvent") {
        userId = (event as UserAssignedEvent).userId + "";
        participants[userId + ""] = users.find((u) => u._id === userId);
      }
    }
    return { ...issue, participants };
  });
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
  findByRepositoryIdAndLocalId(repositoryId: Repository["_id"], localId: number): Promise<Issue>;
  resolveParticipants(issues: Issue[]): Promise<IssueWithParticipants[]>;
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
  findByRepositoryIdAndLocalId,
  resolveParticipants,
};

export { issueService, validateEventFor };
