import { describe, expect, it, beforeEach } from "@jest/globals";
import { setupGitServer } from "../../jest-hooks.utils";
import { type BranchesService } from "../../../src/features/branches/branches.service";

describe("BranchesService", () => {
  const { setGetBranchesHandler } = setupGitServer();

  let service: BranchesService;
  const username = "testUsername";
  const repoName = "testRepoName";

  beforeEach(async () => {
    const { branchesService } = await import("../../../src/features/branches/branches.service");

    service = branchesService;

    setGetBranchesHandler(() => {
      return new Promise((res, _) => res(["master", "branch1", "branch2"]));
    });
  });

  describe("findMany", () => {
    it("should return filtered branches", async () => {
      const name = "branch";

      const branches = await service.findMany(username, repoName, name);

      expect(branches.length).toBe(2);
    });

    it("should return branches", async () => {
      const branches = await service.findMany(username, repoName);

      expect(branches.length).toBe(3);
    });
  });

  describe("findOne", () => {
    it("should return null", async () => {
      const name = "branch";

      const branch = await service.findOne(username, repoName, name);

      expect(branch).toBeNull();
    });

    it("should return branch", async () => {
      const name = "master";

      const branch = await service.findOne(username, repoName, name);

      expect(branch).not.toBeNull();
      expect(branch).toBe(name);
    });
  });

  describe("count", () => {
    it("should return count", async () => {
      const count = await service.count(username, repoName);

      expect(count).toBe(3);
    });
  });

  describe("create", () => {
    it("should throw MissingEntityException because source does not exist", async () => {
      const source = "notExistingBranch";
      const newBranchName = "newBranchName";

      const createBranch = async () => await service.create(username, repoName, source, newBranchName);

      await expect(createBranch).rejects.toThrowError("Branch notExistingBranch does not exist.");
    });

    it("should throw BadLogicException because branch already exists", async () => {
      const source = "master";
      const newBranchName = "branch1";

      const createBranch = async () => await service.create(username, repoName, source, newBranchName);

      await expect(createBranch).rejects.toThrowError("Branch branch1 already exist.");
    });

    it("should create a new branch", async () => {
      const source = "master";
      const newBranchName = "branch3";

      const createBranch = async () => await service.create(username, repoName, source, newBranchName);

      expect(createBranch).not.toThrowError();
    });
  });

  describe("rename", () => {
    it("should throw MissingEntityException because branch does not exist", async () => {
      const branchName = "notExistingBranch";
      const newBranchName = "newBranchName";

      const renameBranch = async () => await service.rename(username, repoName, branchName, newBranchName);

      await expect(renameBranch).rejects.toThrowError("Branch notExistingBranch does not exist.");
    });

    it("should throw BadLogicException because branch already exists", async () => {
      const branchName = "master";
      const newBranchName = "branch1";

      const renameBranch = async () => await service.rename(username, repoName, branchName, newBranchName);

      await expect(renameBranch).rejects.toThrowError("Branch branch1 already exist.");
    });

    it("should rename an existing branch", async () => {
      const branchName = "master";
      const newBranchName = "branch3";

      const renameBranch = async () => await service.rename(username, repoName, branchName, newBranchName);

      expect(renameBranch).not.toThrowError();
    });
  });

  describe("remove", () => {
    it("should throw MissingEntityException because branch does not exist", async () => {
      const branchName = "notExistingBranch";

      const removeBranch = async () => await service.remove(username, repoName, branchName);

      await expect(removeBranch).rejects.toThrowError("Branch notExistingBranch does not exist.");
    });

    it("should remove an existing branch", async () => {
      const branchName = "master";

      const removeBranch = async () => await service.remove(username, repoName, branchName);

      expect(removeBranch).not.toThrowError();
    });
  });
});
