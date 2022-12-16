import { execCmd } from "./cmd.utils";

export async function createUser(username: string) {
  await execCmd(`adduser -S ${username} -D`);
}
