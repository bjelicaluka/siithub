import { testRepo, type Test } from "./test.repo";

// TODO: Implement connection pool handler
type MongoDbConnectionType = {
  close: () => Promise<void>;
};
const Pool = {
  async connection<T>(
    cb: (connection: MongoDbConnectionType) => Promise<T>
  ): Promise<T> {
    const connection: MongoDbConnectionType = {
      close() {
        return new Promise((r) => r());
      },
    };
    const result = await cb(connection);
    connection.close();
    return result;
  },
};

async function getTestForSomething(id: string): Promise<Test> {
  return Pool.connection<Test>((connection) => testRepo.getTest(connection));
}

const testService = {
  getTestForSomething,
};
export { testService };
