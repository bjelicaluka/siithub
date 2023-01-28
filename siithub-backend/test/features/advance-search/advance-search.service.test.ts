import { describe, expect, it, beforeEach } from "@jest/globals";
import { setupGitServer, setupTestEnv } from "../../jest-hooks.utils";
import { type AdvanceSearchService } from "../../../src/features/advance-search/advance-search.service";
import { type Repository } from "../../../src/features/repository/repository.model";
import { type User } from "../../../src/features/user/user.model";
import { ObjectId } from "mongodb";
import { type Issue, type IssueCreate } from "../../../src/features/issue/issue.model";
import { type PullRequest } from "../../../src/features/pull-requests/pull-requests.model";
import { type Tag } from "../../../src/features/tags/tags.model";

describe("AdvanceSearchService", () => {
  setupTestEnv("AdvanceSearchService");
  setupGitServer();

  let service: AdvanceSearchService;
  let repositoryId: Repository["_id"];
  let privateRepositoryId: Repository["_id"];
  let userId: User["_id"];
  let issueId: Issue["_id"];
  let pullReqId: PullRequest["_id"];
  let tagId: Tag["_id"];

  beforeEach(async () => {
    const { advanceSearchService } = await import("../../../src/features/advance-search/advance-search.service");
    const { repositoryRepo } = await import("../../../src/features/repository/repository.repo");
    const { userRepo } = await import("../../../src/features/user/user.repo");
    const { issueRepo } = await import("../../../src/features/issue/issue.repo");
    const { pullRequestsRepo } = await import("../../../src/features/pull-requests/pull-requests.repo");
    const { tagsRepo } = await import("../../../src/features/tags/tags.repo");

    service = advanceSearchService;

    repositoryId = (
      (await repositoryRepo.crud.add({
        name: "publicRepo",
        type: "public",
      } as any)) as Repository
    )?._id;

    privateRepositoryId = (
      (await repositoryRepo.crud.add({
        name: "privateRepo",
        type: "private",
      } as any)) as Repository
    )?._id;

    userId = (
      (await userRepo.crud.add({
        username: "user1",
        bio: "biografija",
        name: "User",
        email: "user@sitthub.com",
      } as any)) as User
    )?._id;

    const issue: IssueCreate = {
      events: [],
      csm: {
        title: "Naslov",
        description: "Opis",
      },
      repositoryId,
    };

    const createIssue = (await issueRepo.crud.add(issue as any)) as Issue;
    issueId = createIssue._id;

    const pr = (await pullRequestsRepo.crud.add({ csm: { title: "PR naslov" }, repositoryId } as any)) as PullRequest;
    pullReqId = pr?._id;

    const tag = (await tagsRepo.crud.add({
      version: "v1.0.0",
      repositoryId,
      name: "Tag",
      author: userId,
    } as any)) as Tag;

    tagId = tag?._id;
  });

  describe("searchRepositories", () => {
    it("should return empty list", async () => {
      const repos = await service.searchRepositories("nepostojeci", new ObjectId());

      expect(repos.length).toBe(0);
    });

    it("should return one element", async () => {
      const repos = await service.searchRepositories("repo", userId);

      expect(repos.length).toBe(1);
      expect(repos[0]._id.toString()).toBe(repositoryId.toString());
    });
  });

  describe("countRepositories", () => {
    it("should return 0", async () => {
      const count = await service.countRepositories("nepostojeci", new ObjectId());

      expect(count).toBe(0);
    });
    it("should return 1", async () => {
      const count = await service.countRepositories("repo", userId);

      expect(count).toBe(1);
    });
  });

  describe("searchUsers", () => {
    it("should return empty list", async () => {
      const users = await service.searchUsers("nepostojeci");

      expect(users.length).toBe(0);
    });

    it("should return one user", async () => {
      const users = await service.searchUsers("user");

      expect(users.length).toBe(1);
      expect(users[0]._id.toString()).toBe(userId.toString());
      expect(users[0]).toHaveProperty("name", "User");
    });
  });

  describe("countUsers", () => {
    it("should return 0", async () => {
      const count = await service.countUsers("nepostojeci");

      expect(count).toBe(0);
    });
    it("should return 1", async () => {
      const count = await service.countUsers("user");

      expect(count).toBe(1);
    });
  });

  describe("searchIssues", () => {
    it("should return empty list", async () => {
      const issues = await service.searchIssues("nepostojeci", userId, new ObjectId());

      expect(issues.length).toBe(0);
    });

    it("should return one issue", async () => {
      const issues = await service.searchIssues("opi", userId, repositoryId);
      expect(issues.length).toBe(1);
      expect(issues[0]._id.toString()).toBe(issueId.toString());
      expect(issues[0].csm).toHaveProperty("description", "Opis");
    });
  });

  describe("countIssues", () => {
    it("should return 0", async () => {
      const count = await service.countIssues("nepostojeci", userId, new ObjectId());

      expect(count).toBe(0);
    });
    it("should return 1", async () => {
      const count = await service.countIssues("opis", userId, repositoryId);

      expect(count).toBe(1);
    });
  });

  describe("searchPullRequest", () => {
    it("should return empty list", async () => {
      const requests = await service.searchPullRequest("nepostojeci", userId, repositoryId);
      expect(requests.length).toBe(0);
    });

    it("should return one pull request", async () => {
      const requests = await service.searchPullRequest("Pr", userId, repositoryId);
      expect(requests.length).toBe(1);
      expect(requests[0]._id.toString()).toBe(pullReqId.toString());
      expect(requests[0].csm).toHaveProperty("title", "PR naslov");
    });
  });

  describe("countPullRequest", () => {
    it("should return 0", async () => {
      const count = await service.countPullRequest("nepostojeci", userId, repositoryId);

      expect(count).toBe(0);
    });
    it("should return 1", async () => {
      const count = await service.countPullRequest("Pr", userId, repositoryId);

      expect(count).toBe(1);
    });
  });

  describe("searchTags", () => {
    it("should return empty list", async () => {
      const requests = await service.searchTags("nepostojeci", userId, repositoryId);
      expect(requests.length).toBe(0);
    });

    it("should return one tag", async () => {
      const requests = await service.searchTags("tag", userId, repositoryId);
      expect(requests.length).toBe(1);
      expect(requests[0]._id.toString()).toBe(tagId.toString());
      expect(requests[0]).toHaveProperty("name", "Tag");
    });
  });

  describe("countTags", () => {
    it("should return 0", async () => {
      const count = await service.countTags("nepostojeci", userId, repositoryId);

      expect(count).toBe(0);
    });
    it("should return 1", async () => {
      const count = await service.countTags("tag", userId, repositoryId);

      expect(count).toBe(1);
    });
  });
});
