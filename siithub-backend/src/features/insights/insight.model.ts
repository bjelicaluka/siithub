export type GroupedCommitCount = {
  date: string;
  commits: number;
};

export type ContributorInsights = {
  all: GroupedCommitCount[];
  perAuthor: {
    data: GroupedCommitCount[];
    author: string;
    total: number;
    additions: number;
    deletitions: number;
  }[];
};

export type CodeFrequencyInsight = {
  date: string;
  adds: number;
  dels: number;
};

export type CommitsInsights = {
  weekly: GroupedCommitCount[];
  daily: GroupedCommitCount[];
};
