import { describe, expect, it, beforeEach } from "@jest/globals";
import { setupGitServer, setupTestEnv } from "../../jest-hooks.utils";
import { type DefaultBranchService } from "../../../src/features/branches/default-branch.service";
import { type Repository } from "../../../src/features/repository/repository.model";

describe("DefaultBranchService", () => {
  setupTestEnv("DefaultBranchService");
  const { setGetBranchesHandler } = setupGitServer();

  let service: DefaultBranchService;
  const username = "testUsername";
  const repoName = "testRepoName";

  const username2 = "testUsername2";
  const repoName2 = "testRepoName2";

  beforeEach(async () => {
    const { defaultBranchService } = await import("../../../src/features/branches/default-branch.service");
    const { defaultBranchRepo } = await import("../../../src/features/branches/default-branch.repo");
    const { repositoryRepo } = await import("../../../src/features/repository/repository.repo");

    service = defaultBranchService;

    await repositoryRepo.crud.add({
      owner: username,
      name: repoName,
    } as any);

    const repositoryId = (
      (await repositoryRepo.crud.add({
        owner: username2,
        name: repoName2,
      } as any)) as Repository
    )._id;

    await defaultBranchRepo.crud.add({
      repositoryId,
      branch: "develop",
    });

    setGetBranchesHandler(() => {
      return new Promise((res, _) => res(["master", "branch1", "branch2"]));
    });
  });

  describe("findByRepository", () => {
    it("should throw MissingEntityException because repository does not exist", async () => {
      const findByRepository = async () => await service.findByRepository(username, "nonExistingRepoName");

      await expect(findByRepository).rejects.toThrow("Given repository does not exist.");
    });

    it("should return newly created default branch", async () => {
      const found = await service.findByRepository(username, repoName);

      expect(found).toHaveProperty("branch", "master");
    });

    it("should return default branch", async () => {
      const found = await service.findByRepository(username2, repoName2);

      expect(found).toHaveProperty("branch", "develop");
    });
  });

  describe("changeDefaultBranch", () => {
    it("should throw MissingEntityException because repository does not exist", async () => {
      const newBranchName = "branch1";

      const changeDefaultBranch = async () => await service.change(username, "nonExistingRepoName", newBranchName);

      await expect(changeDefaultBranch).rejects.toThrow("Given repository does not exist.");
    });

    it("should throw MissingEntityException because branch does not exist", async () => {
      const newBranchName = "develop";

      const changeDefaultBranch = async () => await service.change(username, repoName, newBranchName);

      await expect(changeDefaultBranch).rejects.toThrow("Branch develop does not exist.");
    });

    it("should return default branch", async () => {
      const newBranchName = "branch1";

      const defaultBranch = await service.change(username, repoName, newBranchName);

      expect(defaultBranch).toHaveProperty("branch", "branch1");
    });
  });
});
