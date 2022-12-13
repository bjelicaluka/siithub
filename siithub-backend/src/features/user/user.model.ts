import { BaseEntity } from "../../db/base.repo.utils";

export enum UserType {
  Developer,
  Admin
}

export type PasswordAccount = {
  passwordHash: string,
  salt: string
};

export type GithubAccount = {
  githubId: string
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
export type UserCreate = Omit<User, "_id" | "type"> & { password: string };
export type UserUpdate = Partial<User>;