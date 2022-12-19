import { describe, expect, it, beforeEach } from "@jest/globals";
import { setupTestEnv } from "../../jest-hooks.utils";
import { type IssueRepo } from "../../../src/features/issue/issue.repo"

describe("IssuesRepo", () => {
  setupTestEnv("IssuesRepo");

	let repository: IssueRepo;

  beforeEach(async () => {
		const { issueRepo } = await import("../../../src/features/issue/issue.repo")
		repository = issueRepo;
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


})