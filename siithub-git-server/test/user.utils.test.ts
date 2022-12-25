import { describe, expect, it, beforeEach, afterEach } from "@jest/globals";
import { execCmd } from "../src/cmd.utils";
import { createUser } from "../src/user.utils";

describe("User Utils", () => {
  // remove user and group if exist before running tests
  beforeEach(async () => {
    try {
      await execCmd(`deluser --remove-home new-user`);
    } catch (error) {
      //
    }
  });

  afterEach(async () => {
    try {
      await execCmd(`deluser --remove-home new-user`);
    } catch (error) {
      //
    }
  });

  describe("createUser", () => {
    it("should create user", async () => {
      await createUser("new-user");

      await expect(
        execCmd(`cat /etc/passwd | grep new-user`)
      ).resolves.not.toHaveLength(0);

      await expect(execCmd(`ls -la /home/new-user/`)).resolves.not.toHaveLength(
        0
      );
    });
  });

});
