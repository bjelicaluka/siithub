import { describe, expect, it, beforeEach } from "@jest/globals";
import { setupTestEnv } from "../../jest-hooks.utils";
import { type LabelRepo } from "../../../src/features/label/label.repo"

describe("LabelRepo", () => {
	setupTestEnv("LabelRepo");

	let repository: LabelRepo;

	beforeEach(async () => {
		const { labelRepo } = await import("../../../src/features/label/label.repo")
		repository = labelRepo;
	});

	describe("findByRepositoryId", () => {
		it("shouldn't find by repositoryId", async () => {
			const repositoryId = "nonExistingId";

			const found = await repository.findByRepositoryId(repositoryId);
			expect(found.length).toBeFalsy();
		});

		it("should find by repositoryId", async () => {
			const repositoryId = "existingRepositoryId";
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
			const repositoryId = "NonExistingId";

			const found = await repository.findByNameAndRepositoryId(name, repositoryId);
			expect(found).toBeNull();
		});

		it("should find by name and repositoryId", async () => {
			const name = "ExistingName";
			const repositoryId = "ExistingId";

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
			const repositoryId = "searchByRepositoryId";

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