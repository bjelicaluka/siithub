export type Test = {
  id: string;
  name: string;
};

// TODO: implement base repo util
type MongoDbConnectionType = {};

async function getTest(connection: MongoDbConnectionType): Promise<Test> {
  return new Promise((r) => r({ id: "1", name: "ASD" }));
}

const testRepo = {
  getTest,
};
export { testRepo };
