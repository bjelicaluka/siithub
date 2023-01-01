import { describe, expect, it, beforeEach, afterEach } from "@jest/globals";
import { execCmd } from "../../src/cmd.utils";
import { createRepo, removeRepo } from "../../src/git/repository.utils";

describe("Repository Utils", () => {
  // remove user and group if exist before running tests
  beforeEach(async () => {
    try {
      await execCmd(`deluser --remove-home test-user`);
    } catch (error) {
      //
    }
    try {
      await execCmd(`delgroup test-repository-name`);
    } catch (error) {
      //
    }
  });

  afterEach(async () => {
    try {
      await execCmd(`deluser --remove-home test-user`);
    } catch (error) {
      //
    }
    try {
      await execCmd(`delgroup test-repository-name`);
    } catch (error) {
      //
    }
    try {
      await execCmd(`rm -r /home/_deleted`);
    } catch (error) {
      //
    }
  });

  describe("createRepo", () => {
    it("should create repository with a specific owner", async () => {
      await createRepo("test-user", "test-repository-name");

      await expect(
        execCmd(`ls -la /home/test-user/test-repository-name`)
      ).resolves.not.toHaveLength(0);
    });
  });

  describe("removeRepo", () => {
    it("should remove repository with a specific owner", async () => {
      await createRepo("test-user", "test-repository-name");

      await expect(
        execCmd(`ls -la /home/test-user/test-repository-name`)
      ).resolves.not.toHaveLength(0);

      await removeRepo("test-user", "test-repository-name");
      await expect(
        execCmd(`ls -la /home/test-user/test-repository-name`)
      ).rejects.not.toHaveLength(0);

      await expect(
        execCmd(`ls -la /home/_deleted/test-repository-name`)
      ).resolves.not.toHaveLength(0);

      await expect(
        execCmd(`ls -la /home/_deleted/test-repository-name`)
      ).resolves.not.toHaveLength(0);

      const result = await execCmd(`ls -l /home/_deleted`);
      expect(result.includes("test-user")).toBeFalsy();
    });
  });
});
