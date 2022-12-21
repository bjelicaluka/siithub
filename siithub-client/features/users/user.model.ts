export enum UserType {
  Developer,
  Admin
}

export type PasswordAccount = {
  passwordHash: string,
  salt: string
};

export type GithubAccount = {
  username: string
};

export type User = {
  _id: string
  username: string,
  name: string,
  email: string,
  bio: string,
  type: UserType,
  passwordAccount?: PasswordAccount,
  githubAccount?: GithubAccount
};