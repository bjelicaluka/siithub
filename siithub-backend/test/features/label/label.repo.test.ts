import { describe, expect, it, beforeEach } from "@jest/globals";
import { setupTestEnv } from "../../jest-hooks.utils";
import { type LabelRepo } from "../../../src/features/label/label.repo"
import { type Repository } from "../../../src/features/repository/repository.model";
import { ObjectId } from "mongodb";

describe("LabelRepo", () => {
	setupTestEnv("LabelRepo");

	let repository: LabelRepo;
	let repositoryId: Repository["_id"];

	beforeEach(async () => {
		const { labelRepo } = await import("../../../src/features/label/label.repo")
		const { repositoryRepo } = await import("../../../src/features/repository/repository.repo")

		repository = labelRepo;
		repositoryId = (await repositoryRepo.crud.add({
			name: 'repoForLabels'
		} as any) as Repository)?._id;
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

	describe("findByNameAndRepositoryId", () => {
		it("shouldn't find by name and repositoryId", async () => {
			const name = "NonExistingName";
			const repositoryId =  new ObjectId();

			const found = await repository.findByNameAndRepositoryId(name, repositoryId);
			expect(found).toBeNull();
		});

		it("should find by name and repositoryId", async () => {
			const name = "ExistingName";

			const added = await repository.crud.add({name, repositoryId} as any);

			expect(added).not.toBeNull();
			expect(added).toHaveProperty("_id");
			if (!added) return;

			const found = await repository.findByNameAndRepositoryId(name, repositoryId);
			expect(found).not.toBeNull();
			expect(found).toHaveProperty("repositoryId", repositoryId);
			expect(found).toHaveProperty("name", name);
		});
	});

	describe("searchByName", () => {
		it("should search by name", async () => {
			const name = "SearchName";

			const added = await repository.crud.add({name, repositoryId} as any);

			expect(added).not.toBeNull();
			expect(added).toHaveProperty("_id");
			if (!added) return;

			const nameToSearch = "name";

			const found = await repository.searchByName(nameToSearch, repositoryId);
			expect(found?.length).not.toBeFalsy();
		});
	})
})