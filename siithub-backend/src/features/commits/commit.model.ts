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

export type CommitWithDiff = Commit & {
  diff: {
    old: { path: string; content: string | undefined };
    new: { path: string; content: string | undefined };
    stats: {
      total_additions: number;
      total_deletions: number;
    };
    large: boolean;
  }[];
};
