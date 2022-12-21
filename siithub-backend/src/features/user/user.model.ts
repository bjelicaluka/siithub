import { type BaseEntity } from "../../db/base.repo.utils";

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
  username: string,
  name: string,
  email: string,
  bio: string,
  type: UserType,
  passwordAccount?: PasswordAccount,
  githubAccount?: GithubAccount
} & BaseEntity;
export type UserCreate = Omit<User, "_id" | "type"> & { type?: UserType, password: string, githubUsername?: string|undefined };
export type UserUpdate = Partial<User>;