import { describe, expect, it, beforeEach, afterEach } from "@jest/globals";
import { execCmd } from "../../src/cmd.utils";
import { createRepo, removeRepo } from "../../src/git/repository.utils";

describe("Repository Utils", () => {
  const username = "test-user";
  const repository = "test-repository-name";

  // remove user and group if exist before running tests
  beforeEach(async () => {
    try {
      await execCmd(`deluser --remove-home ${username}`);
    } catch (error) {
      //
    }
    try {
      await execCmd(`delgroup ${username}-${repository}`);
    } catch (error) {
      //
    }
  });

  afterEach(async () => {
    try {
      await execCmd(`rm -r /home/_deleted`);
    } catch (error) {
      //
    }
    try {
      await execCmd(`rm -r /home/${username}`);
    } catch (error) {
      //
    }
  });

  describe("createRepo", () => {
    it("should create repository with a specific owner", async () => {
      await createRepo(username, repository);

      await expect(execCmd(`ls -la /home/${username}/${repository}`)).resolves.not.toHaveLength(0);
    });
  });

  describe("removeRepo", () => {
    it("should remove repository with a specific owner", async () => {
      await createRepo(username, repository);

      await expect(execCmd(`ls -la /home/${username}/${repository}`)).resolves.not.toHaveLength(0);

      await removeRepo(username, repository);
      await expect(execCmd(`ls -la /home/${username}/${repository}`)).rejects.not.toHaveLength(0);

      await expect(execCmd(`ls -la /home/_deleted/${repository}`)).resolves.not.toHaveLength(0);

      await expect(execCmd(`ls -la /home/_deleted/${repository}`)).resolves.not.toHaveLength(0);

      const result = await execCmd(`ls -l /home/_deleted`);
      expect(result.includes(username)).toBeFalsy();
    });
  });
});
