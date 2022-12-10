import { describe, expect, it, beforeEach } from "@jest/globals";
import type * as moduleType from "../../src/db/mongo.utils";
import { setupTestEnv } from "../jest-hooks.utils";

describe("Connection", () => {
  setupTestEnv("connection");

  let module: typeof moduleType;

  beforeEach(async () => {
    module = await import("../../src/db/mongo.utils");
  });

  it("should return a connection to the test db", async () => {
    const connection = await module.getConnection();
    expect(connection.databaseName).toBe("siithub_test");
    const collection = await module.getCollection("test");
    expect(collection.collectionName).not.toBe("test");
    expect(
      collection.collectionName.endsWith("-test") &&
        collection.collectionName.startsWith("connection-")
    ).toBeTruthy();
  });
});
