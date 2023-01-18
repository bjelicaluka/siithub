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

export type LastCommitAndContrib = Commit & { contributors: AuthorInfo[] };