import { describe, expect, it, beforeEach } from "@jest/globals";
import { setupGitServer, setupTestEnv } from "../../jest-hooks.utils";
import { type IssueService } from "../../../src/features/issue/issue.service";
import { IssueState, type IssueCreate, type IssueUpdate, type Issue } from "../../../src/features/issue/issue.model";
import { createEvent } from "../utils";
import { type Label } from "../../../src/features/label/label.model";
import { type User } from "../../../src/features/user/user.model";
import { type Repository } from "../../../src/features/repository/repository.model";
import { ObjectId } from "mongodb";
import { type Milestone } from "../../../src/features/milestone/milestone.model";
import {
  type LabelAssignedEvent,
  type MilestoneAssignedEvent,
  type UserAssignedEvent,
} from "../../../src/features/common/events/events.model";

describe("IssueService", () => {
  setupTestEnv("IssueService");
  setupGitServer();

  let service: IssueService;
  let repositoryId: Repository["_id"];
  let firstUserId: User["_id"];
  let secondUserId: User["_id"];
  let labelId: Label["_id"];
  let milestoneId: Milestone["_id"];

  beforeEach(async () => {
    const { issueService } = await import("../../../src/features/issue/issue.service");
    const { repositoryRepo } = await import("../../../src/features/repository/repository.repo");
    const { userRepo } = await import("../../../src/features/user/user.repo");
    const { labelRepo } = await import("../../../src/features/label/label.repo");
    const { milestoneRepo } = await import("../../../src/features/milestone/milestone.repo");

    service = issueService;

    repositoryId = (
      (await repositoryRepo.crud.add({
        name: "repoForIssues",
      } as any)) as Repository
    )?._id;

    firstUserId = (
      (await userRepo.crud.add({
        username: "userForIssues1",
      } as any)) as User
    )?._id;
    secondUserId = (
      (await userRepo.crud.add({
        username: "userForIssues2",
      } as any)) as User
    )?._id;

    labelId = (
      (await labelRepo.crud.add({
        name: "labelForIssues",
      } as any)) as Label
    )?._id;

    milestoneId = (
      (await milestoneRepo.crud.add({
        name: "milestoneForIssues",
      } as any)) as Milestone
    )?._id;
  });

  describe("create", () => {
    it("should throw MissingEntityException because repository does not exist", async () => {
      const repositoryId = new ObjectId();
      const issue: IssueCreate = {
        events: [],
        csm: {},
        repositoryId,
      };

      const createIssue = async () => await service.create(issue);

      await expect(createIssue).rejects.toThrowError("Repository with given id does not exist.");
    });

    it("should create new issue", async () => {
      const issue: IssueCreate = {
        events: [
          { type: "IssueCreatedEvent", title: "Test issue" } as any,
          { type: "LabelAssignedEvent", labelId } as any,
          { type: "MilestoneAssignedEvent", milestoneId } as any,
          { type: "UserAssignedEvent", userId: firstUserId } as any,
        ],
        csm: {},
        repositoryId,
      };

      const createdIssue = await service.create(issue);

      expect(createdIssue).not.toBeNull();
      expect(createdIssue).toHaveProperty("_id");
      expect(createdIssue?.events.length).toBe(4);
      expect(createdIssue?.csm).toHaveProperty("timeStamp");
      expect(createdIssue?.csm).toHaveProperty("state", IssueState.Open);
      expect(createdIssue?.csm).toHaveProperty("title", "Test issue");
      expect(createdIssue?.csm).toHaveProperty("labels", expect.arrayContaining([labelId]));
      expect(createdIssue?.csm).toHaveProperty("milestones", expect.arrayContaining([milestoneId]));
      expect(createdIssue?.csm).toHaveProperty("assignees", expect.arrayContaining([firstUserId]));
    });
  });

  describe("update", () => {
    it("should throw MissingEntityException because issue does not exist", async () => {
      const issue: IssueUpdate = {
        localId: 1,
        _id: new ObjectId(),
        events: [],
        csm: {},
        repositoryId,
      };

      const updateIssue = async () => await service.update(issue);

      await expect(updateIssue).rejects.toThrowError("Issue with given id does not exist.");
    });

    it("should update an existing issue", async () => {
      const createIssue: IssueCreate = {
        events: [
          { type: "IssueCreatedEvent", title: "Test issue" } as any,
          { type: "LabelAssignedEvent", labelId } as any,
          { type: "MilestoneAssignedEvent", milestoneId } as any,
          { type: "UserAssignedEvent", userId: firstUserId } as any,
        ],
        csm: {},
        repositoryId,
      };

      const createdIssue = (await service.create(createIssue)) as Issue;

      const updateIssue: IssueUpdate = {
        _id: createdIssue._id,
        localId: 1,
        events: [
          { type: "IssueUpdatedEvent", title: "Test issue", description: "Test Issue description" } as any,
          { type: "LabelUnassignedEvent", labelId } as any,
          { type: "UserUnassignedEvent", userId: firstUserId } as any,
          { type: "UserAssignedEvent", userId: secondUserId } as any,
          { type: "IssueClosedEvent" } as any,
        ],
        csm: {},
        repositoryId,
      };

      const updatedIssue = await service.update(updateIssue);

      expect(updatedIssue).not.toBeNull();
      expect(updatedIssue).toHaveProperty("_id");
      expect(updatedIssue?.events.length).toBe(9);
      expect(updatedIssue?.csm).toHaveProperty("state", IssueState.Closed);
      expect(updatedIssue?.csm).toHaveProperty("timeStamp");
      expect(updatedIssue?.csm).toHaveProperty("lastModified");
      expect(updatedIssue?.csm).toHaveProperty("title", "Test issue");
      expect(updatedIssue?.csm).toHaveProperty("description", "Test Issue description");
      expect(updatedIssue?.csm.labels?.length).toBe(0);
      expect(createdIssue?.csm).toHaveProperty("milestones", expect.arrayContaining([milestoneId]));
      expect(updatedIssue?.csm).toHaveProperty("assignees", expect.arrayContaining([secondUserId]));
    });
  });

  describe("validateEventFor", () => {
    it("should throw exception because label does not exist", async () => {
      const labelAssigned = createEvent<LabelAssignedEvent>({
        type: "LabelAssignedEvent",
        labelId: new Object(),
        repositoryId,
      });

      const validateEvent = async () => await service.validateEventFor(labelAssigned);

      await expect(validateEvent).rejects.toThrowError();
    });

    // it("should not throw when validating label assign", async () => {
    //   const labelAssigned = createEvent<LabelAssignedEvent>({
    //     type: "LabelAssignedEvent",
    //     labelId: labelId,
    //   });

    //   const validateEvent = async () => await service.validateEventFor(labelAssigned);

    //   expect(validateEvent).not.toThrowError();
    // });

    it("should throw exception because milestone does not exist", async () => {
      const milestoneAssigned = createEvent<MilestoneAssignedEvent>({
        type: "MilestoneAssignedEvent",
        milestoneId: new Object(),
        repositoryId,
      });

      const validateEvent = async () => await service.validateEventFor(milestoneAssigned);

      await expect(validateEvent).rejects.toThrowError();
    });

    // it("should not throw when validating milestone assign", async () => {
    //   const milestoneAssigned = createEvent<MilestoneAssignedEvent>({
    //     type: "MilestoneAssignedEvent",
    //     milestoneId: milestoneId,
    //   });

    //   const validateEvent = async () => await service.validateEventFor(milestoneAssigned);

    //   expect(validateEvent).not.toThrowError();
    // });

    it("should throw exception because user does not exist", async () => {
      const userAssigned = createEvent<UserAssignedEvent>({
        type: "UserAssignedEvent",
        userId: new Object(),
      });

      const validateEvent = async () => await service.validateEventFor(userAssigned);

      await expect(validateEvent).rejects.toThrowError();
    });

    // it("should not throw when validating user assign", async () => {
    //   const userAssigned = createEvent<UserAssignedEvent>({
    //     type: "UserAssignedEvent",
    //     userId: firstUserId,
    //   });

    //   const validateEvent = async () => await service.validateEventFor(userAssigned);

    //   expect(validateEvent).not.toThrowError();
    // });
  });
});
