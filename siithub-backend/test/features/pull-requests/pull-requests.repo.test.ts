import { describe, expect, it, beforeEach } from "@jest/globals";
import { setupTestEnv } from "../../jest-hooks.utils";
import { ObjectId } from "mongodb";
import { type PullRequestsRepo } from "../../../src/features/pull-requests/pull-requests.repo";
import { type Repository } from "../../../src/features/repository/repository.model";
import { type Label } from "../../../src/features/label/label.model";
import { type Milestone } from "../../../src/features/milestone/milestone.model";
import { type User } from "../../../src/features/user/user.model";
import { PullRequestState } from "../../../src/features/pull-requests/pull-requests.model";

describe("PullRequestsRepo", () => {
  setupTestEnv("PullRequestsRepo");

  let repository: PullRequestsRepo;
  let repositoryId: Repository["_id"];
  let localId: number = 1;

  const labelId1: Label["_id"] = new ObjectId();
  const labelId2: Label["_id"] = new ObjectId();

  const user1: User["_id"] = new ObjectId();
  const user2: User["_id"] = new ObjectId();

  const milestone1: Milestone["_id"] = new ObjectId();

  beforeEach(async () => {
    const { pullRequestsRepo } = await import("../../../src/features/pull-requests/pull-requests.repo");
    const { repositoryRepo } = await import("../../../src/features/repository/repository.repo");

    repository = pullRequestsRepo;
    repositoryId = (
      (await repositoryRepo.crud.add({
        name: "repoForPullRequests",
      } as any)) as Repository
    )?._id;
  });

  describe("searchByQuery", () => {
    describe("byRepositoryId", () => {
      it("shouldn't find anything by repository id", async () => {
        await repository.crud.add({ repositoryId: new ObjectId() } as any);

        const queryResult = await repository.searchByQuery({}, repositoryId);

        expect(queryResult.length).toBeFalsy();
      });

      it("should find by repository id", async () => {
        await repository.crud.add({ repositoryId } as any);

        const queryResult = await repository.searchByQuery({}, repositoryId);

        expect(queryResult.length).not.toBeFalsy();
      });
    });

    describe("byTitle", () => {
      it("shouldn't find anything by title", async () => {
        await repository.crud.add({ csm: { title: "Random title" }, repositoryId } as any);

        const queryResult = await repository.searchByQuery({ title: "Exact title" }, repositoryId);

        expect(queryResult.length).toBeFalsy();
      });

      it("should find multiple by title", async () => {
        await repository.crud.add({ csm: { title: "Pull Request Title 1" }, repositoryId } as any);
        await repository.crud.add({ csm: { title: "PuLlRqeuST Title 2" }, repositoryId } as any);

        const queryResult = await repository.searchByQuery({ title: "sT tI" }, repositoryId);

        expect(queryResult.length).toBe(2);
      });
    });

    describe("byState", () => {
      it("shouldn't find anything by state", async () => {
        await repository.crud.add({ csm: { state: PullRequestState.Opened }, repositoryId } as any);

        const queryResult = await repository.searchByQuery({ state: [PullRequestState.Canceled] }, repositoryId);

        expect(queryResult.length).toBeFalsy();
      });

      it("should find multiple by state", async () => {
        await repository.crud.add({ csm: { state: PullRequestState.Approved }, repositoryId } as any);
        await repository.crud.add({ csm: { state: PullRequestState.ChangesRequired }, repositoryId } as any);
        await repository.crud.add({ csm: { state: PullRequestState.Merged }, repositoryId } as any);

        const queryResult = await repository.searchByQuery(
          { state: [PullRequestState.Approved, PullRequestState.Merged] },
          repositoryId
        );

        expect(queryResult.length).toBe(2);
      });
    });

    describe("byAuthor", () => {
      it("shouldn't find anything by author", async () => {
        await repository.crud.add({ csm: { author: user1 }, repositoryId } as any);

        const queryResult = await repository.searchByQuery({ author: user2 }, repositoryId);

        expect(queryResult.length).toBeFalsy();
      });

      it("should find by author", async () => {
        await repository.crud.add({ csm: { author: user2 }, repositoryId } as any);

        const queryResult = await repository.searchByQuery({ author: user2 }, repositoryId);

        expect(queryResult.length).toBe(1);
      });
    });

    describe("byAssignees", () => {
      it("shouldn't find anything by assignees", async () => {
        await repository.crud.add({ csm: { assignees: [user1] }, repositoryId } as any);
        await repository.crud.add({ csm: { assignees: [user2] }, repositoryId } as any);

        const queryResult = await repository.searchByQuery({ assignees: [user1, user2] }, repositoryId);

        expect(queryResult.length).toBeFalsy();
      });

      it("should find mulitple by assignees", async () => {
        await repository.crud.add({ csm: { assignees: [user1, user2] }, repositoryId } as any);
        await repository.crud.add({ csm: { assignees: [user1] }, repositoryId } as any);
        await repository.crud.add({ csm: { assignees: [user2] }, repositoryId } as any);

        const queryResult = await repository.searchByQuery({ assignees: [user2] }, repositoryId);

        expect(queryResult.length).toBe(2);
      });
    });

    describe("byLabels", () => {
      it("shouldn't find anything by labels", async () => {
        await repository.crud.add({ csm: { labels: [labelId1] }, repositoryId } as any);

        const queryResult = await repository.searchByQuery({ labels: [labelId1, labelId2] }, repositoryId);

        expect(queryResult.length).toBeFalsy();
      });

      it("should find mulitple by labels", async () => {
        await repository.crud.add({ csm: { labels: [labelId1] }, repositoryId } as any);
        await repository.crud.add({ csm: { labels: [labelId1, labelId2] }, repositoryId } as any);

        const queryResult = await repository.searchByQuery({ labels: [labelId1, labelId2] }, repositoryId);

        expect(queryResult.length).toBe(1);
      });
    });

    describe("byMilestones", () => {
      it("shouldn't find anything by milestones", async () => {
        await repository.crud.add({ csm: { milestones: [milestone1] }, repositoryId } as any);

        const queryResult = await repository.searchByQuery({ milestones: [new ObjectId()] }, repositoryId);

        expect(queryResult.length).toBeFalsy();
      });

      it("should find mulitple by milestones", async () => {
        await repository.crud.add({ csm: { milestones: [milestone1] }, repositoryId } as any);

        const queryResult = await repository.searchByQuery({ milestones: [milestone1] }, repositoryId);

        expect(queryResult.length).toBe(1);
      });
    });
  });

  describe("findByRepositoryIdAndLocalId", () => {
    it("shouldn't find by repositoryId", async () => {
      const added = await repository.crud.add({ repositoryId, localId } as any);

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      const found = await repository.findByRepositoryIdAndLocalId(new ObjectId(), localId);
      expect(found).toBeFalsy();
    });

    it("shouldn't find by localId", async () => {
      const added = await repository.crud.add({ repositoryId, localId } as any);

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      const found = await repository.findByRepositoryIdAndLocalId(repositoryId, 2);
      expect(found).toBeFalsy();
    });

    it("should find by repositoryId and localId", async () => {
      const added = await repository.crud.add({ repositoryId, localId } as any);

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      const found = await repository.findByRepositoryIdAndLocalId(repositoryId, localId);
      expect(found).not.toBeFalsy();
      expect(found).toHaveProperty("repositoryId", repositoryId);
    });
  });

  describe("findByRepositoryId", () => {
    it("shouldn't find by repositoryId", async () => {
      const repositoryId = new ObjectId();

      const found = await repository.findByRepositoryId(repositoryId);
      expect(found.length).toBeFalsy();
    });

    it("should find by repositoryId", async () => {
      const added = await repository.crud.add({ repositoryId } as any);

      expect(added).not.toBeNull();
      expect(added).toHaveProperty("_id");
      if (!added) return;

      const found = await repository.findByRepositoryId(repositoryId);
      expect(found.length).not.toBeFalsy();
      expect(found[0]).toHaveProperty("repositoryId", repositoryId);
    });
  });
});
