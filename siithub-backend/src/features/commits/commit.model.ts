import { type Repository } from "../repository/repository.model";

type AuthorInfo = {
  name: string;
  email: string;
  username: string;
  bio: string;
};

export type Commit = {
  message: string;
  sha: string;
  date: string;
  author: AuthorInfo;
};

export type CommitsWithRepo = {
  commits: Commit[];
  repository: Repository;
};

export type LastCommitAndContrib = Commit & { contributors: AuthorInfo[] };

export type CommitWithDiff = Commit & {
  stats: { add: number; del: number; files: number };
};
