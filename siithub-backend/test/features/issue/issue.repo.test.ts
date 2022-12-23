import { describe, expect, it, beforeEach } from "@jest/globals";
import { setupTestEnv } from "../../jest-hooks.utils";
import { type IssueRepo } from "../../../src/features/issue/issue.repo"
import { ObjectId } from "mongodb";
import { type Repository } from "../../../src/features/repository/repository.model";
import { type Label } from "../../../src/features/label/label.model";
import { type User } from "../../../src/features/user/user.model";
import { IssueState } from "../../../src/features/issue/issue.model";
import { type Milestone } from "../../../src/features/milestone/milestone.model";

describe("IssuesRepo", () => {
  setupTestEnv("IssuesRepo");

	let repository: IssueRepo;
	let repositoryId: Repository["_id"];

	const labelId1: Label["_id"] = new ObjectId();
	const labelId2: Label["_id"] = new ObjectId();
	const labelId3: Label["_id"] = new ObjectId();

	const user1: User["_id"] = new ObjectId();
	const user2: User["_id"] = new ObjectId();

	const milestone1: Milestone["_id"] = new ObjectId();
	const milestone2: Milestone["_id"] = new ObjectId();

  beforeEach(async () => {
		const { issueRepo } = await import("../../../src/features/issue/issue.repo")
		const { repositoryRepo } = await import("../../../src/features/repository/repository.repo")

		repository = issueRepo;
		repositoryId = (await repositoryRepo.crud.add({
			name: 'repoForIssues'
		} as any) as Repository)?._id;

	});

	describe("searchByQuery", () => {

		describe("byRepositoryId", () => {
			it("shouldn't find anything by repository id", async () => {
				await repository.crud.add({ repositoryId: new ObjectId() } as any);
	
				const queryResult = await repository.searchByQuery({}, repositoryId);
	
				expect(queryResult.length).toBeFalsy();
			})
	
			it("should find by repository id", async () => {
				await repository.crud.add({ repositoryId } as any);
	
				const queryResult = await repository.searchByQuery({}, repositoryId);
	
				expect(queryResult.length).not.toBeFalsy();
			})
		})

		describe("byTitle", () => {
			it("shouldn't find anything by title", async () => {
				await repository.crud.add({ csm: { title: 'Random title'}, repositoryId } as any);
	
				const queryResult = await repository.searchByQuery({ title: 'Exact title' }, repositoryId);
	
				expect(queryResult.length).toBeFalsy();
			})
	
			it("should find multiple by title", async () => {
				await repository.crud.add({ csm: { title: 'Issue Title 1' }, repositoryId } as any);
				await repository.crud.add({ csm: { title: 'iSsUE Title 2' }, repositoryId } as any);
	
				const queryResult = await repository.searchByQuery({ title: 'suE ti' }, repositoryId);
	
				expect(queryResult.length).toBe(2);
			})	
		})

		describe("byState", () => {
			it("shouldn't find anything by state", async () => {
				await repository.crud.add({ csm: { state: IssueState.Reopened}, repositoryId } as any);

				const queryResult = await repository.searchByQuery({ state: [IssueState.Closed] }, repositoryId);
	
				expect(queryResult.length).toBeFalsy();
			})
	
			it("should find multiple by state", async () => {
				await repository.crud.add({ csm: { state: IssueState.Open}, repositoryId } as any);
				await repository.crud.add({ csm: { state: IssueState.Open}, repositoryId } as any);
				await repository.crud.add({ csm: { state: IssueState.Closed}, repositoryId } as any);

				const queryResult = await repository.searchByQuery({ state: [IssueState.Open, IssueState.Reopened] }, repositoryId);
	
				expect(queryResult.length).toBe(2);
			})	
		})

		describe("byAuthor", () => {
			it("shouldn't find anything by author", async () => {
				await repository.crud.add({ csm: { author: user1 }, repositoryId } as any);

				const queryResult = await repository.searchByQuery({ author: user2 }, repositoryId);
	
				expect(queryResult.length).toBeFalsy();
			})
	
			it("should find by author", async () => {
				await repository.crud.add({ csm: { author: user2 }, repositoryId } as any);

				const queryResult = await repository.searchByQuery({ author: user2 }, repositoryId);
	
				expect(queryResult.length).toBe(1);
			})	
		})

		
		describe("byAssignees", () => {
			it("shouldn't find anything by assignees", async () => {
				await repository.crud.add({ csm: { assignees: [user1] }, repositoryId } as any);
				await repository.crud.add({ csm: { assignees: [user2] }, repositoryId } as any);

				const queryResult = await repository.searchByQuery({ assignees: [user1, user2] }, repositoryId);
	
				expect(queryResult.length).toBeFalsy();
			})
	
			it("should find mulitple by assignees", async () => {
				await repository.crud.add({ csm: { assignees: [user1, user2] }, repositoryId } as any);
				await repository.crud.add({ csm: { assignees: [user1] }, repositoryId } as any);
				await repository.crud.add({ csm: { assignees: [user2] }, repositoryId } as any);

				const queryResult = await repository.searchByQuery({ assignees: [user2] }, repositoryId);
		
				expect(queryResult.length).toBe(2);
			})	
		})

		describe("byLabels", () => {
			it("shouldn't find anything by labels", async () => {
				await repository.crud.add({ csm: { labels: [labelId1, labelId2] }, repositoryId } as any);
				await repository.crud.add({ csm: { labels: [labelId2, labelId3] }, repositoryId } as any);

				const queryResult = await repository.searchByQuery({ labels: [labelId1, labelId2, labelId3] }, repositoryId);
	
				expect(queryResult.length).toBeFalsy();
			})
	
			it("should find mulitple by labels", async () => {
				await repository.crud.add({ csm: { labels: [labelId1, labelId2] }, repositoryId } as any);
				await repository.crud.add({ csm: { labels: [labelId2, labelId3] }, repositoryId } as any);
				await repository.crud.add({ csm: { labels: [labelId1, labelId2, labelId3] }, repositoryId } as any);

				const queryResult = await repository.searchByQuery({ labels: [labelId1, labelId2, labelId3] }, repositoryId);
		
				expect(queryResult.length).toBe(1);
			})	
		})

		describe("byMilestones", () => {
			it("shouldn't find anything by milestones", async () => {
				await repository.crud.add({ csm: { milestones: [milestone1] }, repositoryId } as any);
				await repository.crud.add({ csm: { milestones: [milestone2] }, repositoryId } as any);

				const queryResult = await repository.searchByQuery({ milestones: [milestone1, milestone2] }, repositoryId);
	
				expect(queryResult.length).toBeFalsy();
			})
	
			it("should find mulitple by milestones", async () => {
				await repository.crud.add({ csm: { milestones: [milestone1, milestone2] }, repositoryId } as any);
				await repository.crud.add({ csm: { milestones: [milestone1] }, repositoryId } as any);
				await repository.crud.add({ csm: { milestones: [milestone2] }, repositoryId } as any);

				const queryResult = await repository.searchByQuery({ milestones: [milestone1] }, repositoryId);
		
				expect(queryResult.length).toBe(2);
			})	
		})
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


})