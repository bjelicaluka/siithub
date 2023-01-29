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
  let getBranchesHandler: () => void = () => {};
  let getCommitsHandler: () => void = () => {};
  let getCommitsShaHandler: () => void = () => {};
  let createTagHandler: () => void = () => {};
  let deleteTagHandler: () => void = () => {};
  let createRepoForkHandler: () => void = () => {};

  beforeEach(async () => {
    jest.mock("../src/features/gitserver/gitserver.client.ts", () => ({
      gitServerClient: {
        createUser: jest.fn(() => createUserHandler()),
        createRepository: jest.fn(() => createRepoHandler()),
        deleteRepository: jest.fn(() => deleteRepoHandler()),
        addSshKey: jest.fn(() => addSshKeyHandler()),
        updateSshKey: jest.fn(() => updateSshKeyHandler()),
        removeSshKey: jest.fn(() => removeSshKeyHandler()),
        getBranches: jest.fn(() => getBranchesHandler()),
        createBranch: jest.fn(() => () => {}),
        renameBranch: jest.fn(() => () => {}),
        removeBranch: jest.fn(() => () => {}),
        addCollaborator: jest.fn(() => () => {}),
        removeCollaborator: jest.fn(() => () => {}),
        getCommits: jest.fn(() => getCommitsHandler()),
        getCommitsSha: jest.fn(() => getCommitsShaHandler()),
        createTag: jest.fn(() => () => createTagHandler()),
        deleteTag: jest.fn(() => deleteTagHandler()),
        createRepositoryFork: jest.fn(() => createRepoForkHandler()),
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
    getBranchesHandler = () => {};
    getCommitsHandler = () => {};
    getCommitsShaHandler = () => {};
    createTagHandler = () => {};
    deleteTagHandler = () => {};
    createRepoForkHandler = () => {};
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
      getBranchesHandler = cb;
    },
    setGetCommitsHandler: (cb: () => void) => {
      getCommitsHandler = cb;
    },
    setGetCommitsShaHandler: (cb: () => void) => {
      getCommitsShaHandler = cb;
    },
    setCreateTagHandler: (cb: () => void) => {
      createTagHandler = cb;
    },
    setDeleteTagHandler: (cb: () => void) => {
      deleteTagHandler = cb;
    },
    setCreateRepoForkHandler: (cb: () => void) => {
      createRepoForkHandler = cb;
    },
  };
}
