export type GroupedCommitCount = {
  date: string;
  commits: number;
};

export type ContributorInsights = {
  all: GroupedCommitCount[];
  authorDataMax: {
    adds: number;
    dels: number;
    commits: number;
  };
  perAuthor: {
    data: GroupedCommitCount[];
    author: { username?: string; name: string };
    commitsTotal: number;
    addsTotal: number;
    delsTotal: number;
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
