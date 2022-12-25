import { describe, expect, it, beforeEach } from "@jest/globals";
import { setupTestEnv } from "../../jest-hooks.utils";
import { type MilestoneRepo } from "../../../src/features/milestone/milestone.repo"
import type { RepositoryCreate, Repository } from "../../../src/features/repository/repository.model";
import { ObjectId } from "mongodb";
import { MilestoneCreate } from "../../../src/features/milestone/milestone.model";

describe("MilestoneRepo", () => {
	setupTestEnv("MilestoneRepo");

	let repository: MilestoneRepo;
	let repositoryId: Repository["_id"];

	beforeEach(async () => {
		const { milestoneRepo } = await import("../../../src/features/milestone/milestone.repo")
		const { repositoryRepo } = await import("../../../src/features/repository/repository.repo")

		repository = milestoneRepo;
		repositoryId = (await repositoryRepo.crud.add({
			name: 'repoForMilestones'
		} as RepositoryCreate) as Repository)?._id;
	});

	describe("findByRepositoryId", () => {
		it("shouldn't find by repositoryId", async () => {
			const repositoryId = new ObjectId();

			const found = await repository.findByRepositoryId(repositoryId, true);
			expect(found.length).toBeFalsy();
		});

		it("should find by repositoryId", async () => {
			const added = await repository.crud.add({ repositoryId, isOpen: true } as MilestoneCreate);

			expect(added).not.toBeNull();
			expect(added).toHaveProperty("_id");
			if (!added) return;

			const found = await repository.findByRepositoryId(repositoryId, true);
			expect(found.length).not.toBeFalsy();
			expect(found[0]).toHaveProperty("repositoryId", repositoryId);
		});
	});

	describe("findByTitleAndRepositoryId", () => {
		it("shouldn't find by title and repositoryId", async () => {
			const title = "NonExistingTitle";
			const repositoryId =  new ObjectId();

			const found = await repository.findByTitleAndRepositoryId(title, repositoryId);
			expect(found).toBeNull();
		});

		it("should find by title and repositoryId", async () => {
			const title = "ExistingTitle";

			const added = await repository.crud.add({title, repositoryId} as MilestoneCreate);

			expect(added).not.toBeNull();
			expect(added).toHaveProperty("_id");
			if (!added) return;

			const found = await repository.findByTitleAndRepositoryId(title, repositoryId);
			expect(found).not.toBeNull();
			expect(found).toHaveProperty("repositoryId", repositoryId);
			expect(found).toHaveProperty("title", title);
		});
	});

	describe("searchByTitle", () => {
		it("should search by title", async () => {
			const title = "SearchTitle";

			const added = await repository.crud.add({title, repositoryId} as MilestoneCreate);

			expect(added).not.toBeNull();
			expect(added).toHaveProperty("_id");
			if (!added) return;

			const titleToSearch = "title";

			const found = await repository.searchByTitle(titleToSearch, repositoryId);
			expect(found?.length).not.toBeFalsy();
		});
	})
})