import { describe, expect, it, beforeEach, afterEach } from "@jest/globals";
import { execCmd } from "../src/cmd.utils";
import { addKey, removeKey } from "../src/key.utils";
import { createUser } from "../src/user.utils";

describe("Key Utils", () => {
  // remove user and group if exist before running tests
  beforeEach(async () => {
    try {
      await execCmd(`deluser --remove-home new-key-user`);
    } catch (error) {
      //
    }
  });

  afterEach(async () => {
    try {
      await execCmd(`deluser --remove-home new-key-user`);
    } catch (error) {
      //
    }
  });

  describe("addKey", () => {
    it("should add new key", async () => {
      const username = "new-key-user";
      const key = "testKey lalala\nworkswithnewline";

      await createUser(username);

      await addKey(username, key);

      const authorizedKeys = await execCmd(
        `cat /home/${username}/.ssh/authorized_keys`
      );
      expect(authorizedKeys.includes(key)).toBeTruthy();
    });
  });

  describe("removeKey", () => {
    it("should remove existing key", async () => {
      const username = "new-key-user";
      const key = "testKey lalala\nworkswithnewline";

      await createUser(username);

      await addKey(username, key);

      const authorizedKeys = await execCmd(
        `cat /home/${username}/.ssh/authorized_keys`
      );
      expect(authorizedKeys.includes(key)).toBeTruthy();

      await removeKey(username, key);
      const authorizedKeysAfterRemoval = await execCmd(
        `cat /home/${username}/.ssh/authorized_keys`
      );
      expect(authorizedKeysAfterRemoval.includes(key)).toBeFalsy();
    });
  });
});
