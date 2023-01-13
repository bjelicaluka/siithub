import { execCmd } from "../cmd.utils";

async function addGroup(name: string) {
  await execCmd(`addgroup -S ${name}`);
}

async function deleteGroup(name: string) {
  await execCmd(`delgroup ${name}`);
}

async function addUserToGroup(name: string, user: string) {
  await execCmd(`addgroup ${user} ${name}`);
}

async function deleteUserFromGroup(name: string, user: string) {
  await execCmd(`delgroup ${user} ${name}`);
}

export { addGroup, deleteGroup, addUserToGroup, deleteUserFromGroup };
