import { Filter, FindOptions, ObjectId } from "mongodb";
import type { Repository } from "../repository/repository.model";
import type { PullRequest, PullRequestCreate, PullRequestUpdate } from "./pull-requests.model";
import type { BaseEvent } from "../../db/base.repo.utils";
import type { LabelAssignedEvent, MilestoneAssignedEvent, UserAssignedEvent } from "../common/events/events.model";
import { handleFor } from "./pull-requests.model";
import { pullRequestsRepo } from "./pull-requests.repo";
import { MissingEntityException } from "../../error-handling/errors";
import { repositoryService } from "../repository/repository.service";
import { labelService } from "../label/label.service";
import { milestoneService } from "../milestone/milestone.service";
import { userService } from "../user/user.service";

async function findOne(id: PullRequest["_id"]): Promise<PullRequest | null> {
  return await pullRequestsRepo.crud.findOne(id);
}

async function findOneOrThrow(id: PullRequest["_id"]): Promise<PullRequest> {
  const pullRequest = await pullRequestsRepo.crud.findOne(id);
  if (!pullRequest) {
    throw new MissingEntityException("PullRequest with given id does not exist.");
  }
  return pullRequest;
}

async function findByRepositoryId(repositoryId: Repository["_id"]): Promise<PullRequest[]> {
  return await pullRequestsRepo.findByRepositoryId(repositoryId);
}

async function findByRepositoryIdAndLocalId(repositoryId: Repository["_id"], localId: number): Promise<PullRequest> {
  const pullRequest = await pullRequestsRepo.findByRepositoryIdAndLocalId(repositoryId, localId);
  if (!pullRequest) {
    throw new MissingEntityException("PullRequest with given id does not exist.");
  }
  return pullRequest;
}

async function findMany(
  filters: Filter<PullRequest> = {},
  options: FindOptions<PullRequest> = {}
): Promise<PullRequest[]> {
  return await pullRequestsRepo.crud.findMany(filters, options);
}

async function createPullRequest({ events, repositoryId }: PullRequestCreate): Promise<PullRequest | null> {
  const localId = await repositoryService.increaseCounterValue(repositoryId, "pull-request");
  const createdPullRequest = (await pullRequestsRepo.crud.add({
    events: [],
    csm: {
      base: "",
      compare: "",
      title: "",
    },
    repositoryId,
    localId,
  })) as PullRequest;

  return await updateEventsFor(createdPullRequest, events);
}

async function updatePullRequest({ repositoryId, localId, events }: PullRequestUpdate): Promise<PullRequest | null> {
  const existingPullRequest = await findByRepositoryIdAndLocalId(repositoryId, localId);

  return await updateEventsFor(existingPullRequest, events);
}

async function updateEventsFor(pullRequest: PullRequest, events: BaseEvent[]) {
  for (const event of events) {
    await handleEvent(pullRequest, event);
  }

  return await pullRequestsRepo.crud.update(pullRequest._id, pullRequest);
}

async function handleEvent(pullRequest: PullRequest, event: BaseEvent): Promise<void> {
  await validateEventFor(event);

  event._id = new ObjectId();
  event.streamId = pullRequest._id;
  event.timeStamp = new Date();
  event.by = new ObjectId(event.by?.toString());

  handleFor(pullRequest, event);
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

export type PullRequestService = {
  findOne(id: PullRequest["_id"]): Promise<PullRequest | null>;
  findOneOrThrow(id: PullRequest["_id"]): Promise<PullRequest>;
  findByRepositoryId(repositoryId: Repository["_id"]): Promise<PullRequest[]>;
  findByRepositoryIdAndLocalId(repositoryId: Repository["_id"], localId: number): Promise<PullRequest>;
  findMany(filters?: Filter<PullRequest>, options?: FindOptions<PullRequest>): Promise<PullRequest[]>;
  create(pullRequest: PullRequestCreate): Promise<PullRequest | null>;
  update(pullRequest: PullRequestUpdate): Promise<PullRequest | null>;
  validateEventFor(event: BaseEvent): Promise<void>;
};

const pullRequestService: PullRequestService = {
  findOne,
  findOneOrThrow,
  findByRepositoryId,
  findByRepositoryIdAndLocalId,
  findMany,
  create: createPullRequest,
  update: updatePullRequest,
  validateEventFor,
};

export { pullRequestService, validateEventFor };
