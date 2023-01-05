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

  return {};
}

export function setupGitServer() {
  let createUserHandler: () => void = () => {};
  let createRepoHandler: () => void = () => {};
  let deleteRepoHandler: () => void = () => {};
  let addSshKeyHandler: () => void = () => {};
  let updateSshKeyHandler: () => void = () => {};
  let removeSshKeyHandler: () => void = () => {};
  let getBranches: () => void = () => {};

  beforeEach(async () => {
    jest.mock("../src/features/gitserver/gitserver.client.ts", () => ({
      gitServerClient: {
        createUser: jest.fn(() => createUserHandler()),
        createRepository: jest.fn(() => createRepoHandler()),
        deleteRepository: jest.fn(() => deleteRepoHandler()),
        addSshKey: jest.fn(() => addSshKeyHandler()),
        updateSshKey: jest.fn(() => updateSshKeyHandler()),
        removeSshKey: jest.fn(() => removeSshKeyHandler()),
        getBranches: jest.fn(() => getBranches()),
        createBranch: jest.fn(() => () => {}),
        renameBranch: jest.fn(() => () => {}),
        removeBranch: jest.fn(() => () => {}),
      },
    }));
  });

  afterEach(() => {
    createUserHandler = () => {};
    createRepoHandler = () => {};
    deleteRepoHandler = () => {};
    addSshKeyHandler = () => {};
    updateSshKeyHandler = () => {};
    removeSshKeyHandler = () => {};
    getBranches = () => {};
  });

  return {
    setCreateUserHandler: (cb: () => void) => {
      createUserHandler = cb;
    },
    setCreateRepoHandler: (cb: () => void) => {
      createRepoHandler = cb;
    },
    setDeleteRepoHandler: (cb: () => void) => {
      deleteRepoHandler = cb;
    },
    setAddSshKeyHandler: (cb: () => void) => {
      addSshKeyHandler = cb;
    },
    setUpdateSshKeyHandler: (cb: () => void) => {
      updateSshKeyHandler = cb;
    },
    setRemoveSshKeyHandler: (cb: () => void) => {
      removeSshKeyHandler = cb;
    },
    setGetBranchesHandler: (cb: () => void) => {
      getBranches = cb;
    },
  };
}
