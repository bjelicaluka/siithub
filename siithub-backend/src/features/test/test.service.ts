import { testRepo, type Test } from "./test.repo";

async function getTest(id: string): Promise<Test | null> {
  const result = await testRepo.crud.findOne(id);
  if (!result) {
    // throw 404 error
  }
  return result;
}

const testService = {
  getTest,
};

export { testService };
