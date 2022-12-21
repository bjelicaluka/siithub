import { ObjectId } from "mongodb";
import { type BaseEvent } from "../../db/base.repo.utils";
import { MissingEntityException } from "../../error-handling/errors";
import { labelService } from "../label/label.service";
import { userService } from "../user/user.service";
import { handleAllFor, type IssueCreate, type Issue, type IssueUpdate, handleFor, type LabelAssignedEvent, type UserAssignedEvent } from "./issue.model";
import { issueRepo } from "./issue.repo";

async function findOne(id: Issue["_id"] | string): Promise<Issue | null> {
  const issue = await issueRepo.crud.findOne(id) as Issue;
  const issueToReturn: Issue = { _id: issue?._id, events: [], csm: {}, repositoryId: issue.repositoryId };
  handleAllFor(issueToReturn, issue?.events ?? []);

  return issueToReturn;
}
async function findByRepositoryId(repositoryId: string): Promise<Issue[]> {
  return await issueRepo.findByRepositoryId(repositoryId);
}

// TODO: PARAMS TYPE
async function searchByParams(params: any, repositoryId: string): Promise<Issue[]> {
  return await issueRepo.searchByParams(params, repositoryId);
}


async function findOneOrThrow(id: Issue["_id"] | string): Promise<Issue> {
  const issue = await findOne(id);
  if (!issue) {
    throw new MissingEntityException("Issue with given id does not exist.");
  }
  return issue as Issue;
}

async function createIssue({ events, repositoryId }: IssueCreate): Promise<Issue | null> {
  const createdIssue = await issueRepo.crud.add({
    events: [],
    csm: {},
    repositoryId 
  }) as Issue;

  return await updateEventsFor(createdIssue, events);
}

async function updateIssue({ _id, events }: IssueUpdate): Promise<Issue | null> {
  const existingIssue = await findOneOrThrow(_id);

  return await updateEventsFor(existingIssue, events)
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
    case 'LabelAssignedEvent': {
      const labelAssigned = event as LabelAssignedEvent;
      await labelService.findOneOrThrow(new ObjectId(labelAssigned?.labelId?.toString()));
      return;
    }

    case 'UserAssignedEvent': {
      const userAssigned = event as UserAssignedEvent;
      await userService.findOneOrThrow(new ObjectId(userAssigned?.userId?.toString()));
      return;
    }
  }
}

export type IssueService = {
  create(issue: IssueCreate): Promise<Issue | null>,
  update(issue: IssueUpdate): Promise<Issue | null>,
  findOneOrThrow(id: Issue["_id"] | string): Promise<Issue>,
  findByRepositoryId(repositoryId: string): Promise<Issue[]>,
  searchByParams(params: any, repositoryId: string): Promise<Issue[]>,
  validateEventFor(event: BaseEvent): Promise<void>
}

const issueService: IssueService = {
  findOneOrThrow,
  findByRepositoryId,
  searchByParams,
  create: createIssue,
  update: updateIssue,
  validateEventFor
}

export { issueService, validateEventFor }