import { type User } from "../user/user.model"

export type Credentials = {
  username: string,
  password: string
}

export type AuthenticatedUser = {
  user: User,
  token: string
}