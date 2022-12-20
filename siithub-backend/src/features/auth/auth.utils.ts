import { clearPropertiesOfObject } from "../../utils/wrappers";
import { type User } from "../user/user.model";

function removePassword(user: User) {
  return clearPropertiesOfObject(user, 'passwordAccount');
}

export {
  removePassword
}