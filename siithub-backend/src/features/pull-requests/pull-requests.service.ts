import { Filter, FindOptions, ObjectId } from "mongodb";
import type { Repository } from "../repository/repository.model";
import {
  type PullRequest,
  type PullRequestCreate,
  type PullRequestUpdate,
  type PullRequestCreatedEvent,
  type PullRequestUpdatedEvent,
  type PullRequestWithParticipants,
  PullRequestState,
} from "./pull-requests.model";
import type { BaseEvent } from "../../db/base.repo.utils";
import type { LabelAssignedEvent, MilestoneAssignedEvent, UserAssignedEvent } from "../common/events/events.model";
import { handleFor } from "./pull-requests.model";
import { pullRequestsRepo } from "./pull-requests.repo";
import { BadLogicException, MissingEntityException } from "../../error-handling/errors";
import { repositoryService } from "../repository/repository.service";
import { labelService } from "../label/label.service";
import { milestoneService } from "../milestone/milestone.service";
import { userService } from "../user/user.service";
import { type PullRequestsQuery } from "./pull-requests.query";
import { type User } from "../user/user.model";
import { commitService } from "../commits/commit.service";

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

async function searchByQuery(query: PullRequestsQuery, repositoryId: Repository["_id"]): Promise<PullRequest[]> {
  query.state = query.state?.map((s) => +s);
  return await pullRequestsRepo.searchByQuery(query, repositoryId);
}

async function createPullRequest({ events, repositoryId }: PullRequestCreate): Promise<PullRequest | null> {
  const localId = await repositoryService.increaseCounterValue(repositoryId, "pull-request");
  const createdPullRequest = (await pullRequestsRepo.crud.add({
    events: [],
    csm: {
      isClosed: false,
      state: PullRequestState.Opened,
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
  await validateEventFor(pullRequest, event);

  event._id = new ObjectId();
  event.streamId = pullRequest._id;
  event.timeStamp = new Date();
  event.by = new ObjectId(event.by?.toString());

  if (event.type === "PullRequestMergedEvent") {
    const { owner, name } = await repositoryService.findOneOrThrow(pullRequest.repositoryId);
    const { base, compare } = pullRequest.csm;
    const mergeResult: any = await commitService.mergeCommits(owner, name, base, compare);
    if (!mergeResult) {
      throw new BadLogicException("Unable to merge pull request becase of merge conflicts.");
    }
    const prUpdatedEvent: PullRequestUpdatedEvent = {
      type: "PullRequestUpdatedEvent",
      title: pullRequest.csm.title,
      base: mergeResult.base || pullRequest.csm.base,
      compare: mergeResult.compare || pullRequest.csm.compare,
      _id: new ObjectId(),
      streamId: pullRequest._id,
      timeStamp: new Date(),
      by: new ObjectId(event.by?.toString()),
    };

    handleFor(pullRequest, prUpdatedEvent);
  }

  handleFor(pullRequest, event);
}

async function validateEventFor(pullRequest: PullRequest, event: BaseEvent): Promise<void> {
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

    case "PullRequestUpdatedEvent":
    case "PullRequestCreatedEvent": {
      const prEvent = event as PullRequestCreatedEvent | PullRequestUpdatedEvent;
      const { owner, name } = await repositoryService.findOneOrThrow(pullRequest.repositoryId);
      const { base, compare } = prEvent;
      const commits = await commitService.getCommitsBetweenBranches(owner, name, base, compare);
      if (!commits || !commits.length) {
        throw new BadLogicException("Cannot set those branches because there aren't any changes.");
      }
    }
  }
}

async function resolveParticipants(pullRequests: PullRequest[]): Promise<PullRequestWithParticipants[]> {
  const getPRParticipants = (pullRequest: PullRequest) => {
    return pullRequest.events.flatMap((e: any) => {
      if (e.type !== "UserAssignedEvent") {
        return [new ObjectId(e?.by?.toString())];
      }
      return [new ObjectId(e?.by?.toString()), new ObjectId(e?.userId?.toString())];
    });
  };

  const participantsPerPr = pullRequests.map(getPRParticipants);
  const participantsForAllPrs = participantsPerPr.flatMap((p) => p);

  const users = (await userService.findManyByIds(participantsForAllPrs)).reduce((acc: any, user: User) => {
    acc[user?._id?.toString()] = user;
    return acc;
  }, {});

  return pullRequests.map((pullRequest, i) => {
    const participants = participantsPerPr[i].reduce((acc: any, p) => {
      acc[p?.toString()] = users[p?.toString()];
      return acc;
    }, {});

    return { ...pullRequest, participants };
  });
}

export type PullRequestService = {
  findOne(id: PullRequest["_id"]): Promise<PullRequest | null>;
  findOneOrThrow(id: PullRequest["_id"]): Promise<PullRequest>;
  findByRepositoryId(repositoryId: Repository["_id"]): Promise<PullRequest[]>;
  findByRepositoryIdAndLocalId(repositoryId: Repository["_id"], localId: number): Promise<PullRequest>;
  findMany(filters?: Filter<PullRequest>, options?: FindOptions<PullRequest>): Promise<PullRequest[]>;
  searchByQuery(query: PullRequestsQuery, repositoryId: Repository["_id"]): Promise<PullRequest[]>;
  create(pullRequest: PullRequestCreate): Promise<PullRequest | null>;
  update(pullRequest: PullRequestUpdate): Promise<PullRequest | null>;
  validateEventFor(pullRequest: PullRequest, event: BaseEvent): Promise<void>;
  resolveParticipants(pullRequests: PullRequest[]): Promise<PullRequestWithParticipants[]>;
};

const pullRequestService: PullRequestService = {
  findOne,
  findOneOrThrow,
  findByRepositoryId,
  findByRepositoryIdAndLocalId,
  findMany,
  searchByQuery,
  create: createPullRequest,
  update: updatePullRequest,
  validateEventFor,
  resolveParticipants,
};

export { pullRequestService, validateEventFor };
