import { beforeEach, jest, afterAll, afterEach } from "@jest/globals";
import { Collection, Db, MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config({
  path: ".env.test",
});

const URL = process.env.MONGODB_URL ?? "";
const USERNAME = process.env.MONGODB_USERNAME ?? "";
const PASSWORD = process.env.MONGODB_PASSWORD ?? "";
const DATABASE = process.env.MONGODB_DATABASE ?? "";

export function setupTestEnv(scope: string) {
  let client: MongoClient;
  let db: Db;
  const collections: Collection[] = [];

  beforeEach(async () => {
    const prefix = `${scope}-${Math.random()}`;
    const getConnection = async () => {
      if (db) return db;
      client = new MongoClient(URL, {
        auth: {
          username: USERNAME,
          password: PASSWORD,
        },
      });
      await client.connect();
      db = client.db(DATABASE);
      return db;
    };
    jest.mock("../src/db/mongo.utils.ts", () => ({
      getConnection: jest.fn(getConnection),
      getCollection: jest.fn(async (name: string) => {
        if (!db) {
          await getConnection();
        }
        const collection = db.collection(`${prefix}-${name}`);
        collections.push(collection);
        return collection;
      }),
    }));
  });

  afterEach(async () => {
    await Promise.all(
      collections.map(async (collection) => {
        try {
          await db.dropCollection(collection.collectionName);
        } catch (error) {}
      })
    );
  });

  afterAll(async () => {
    await client.close();
  });

  return { };
}
