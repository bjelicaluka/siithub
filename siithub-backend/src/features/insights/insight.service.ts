import moment from "moment";
import { commitService } from "../commits/commit.service";
import type { CommitWithDiff } from "../commits/commit.model";
import type { Commit } from "../commits/commit.model";
import type { CodeFrequencyInsight, CommitsInsights, ContributorInsights } from "./insight.model";

async function getContributorInsights(
  username: string,
  repoName: string,
  branch: string
): Promise<ContributorInsights> {
  const commits = await commitService.getCommitsWithDiff(username, repoName, branch);

  const all = getWeeklyGroupedCommitCount(commits);

  const authorCommitMap = new Map<string, CommitWithDiff[]>();

  commits.forEach((commit) => {
    if (!authorCommitMap.has(commit.author.name)) {
      authorCommitMap.set(commit.author.name, []);
    }
    authorCommitMap.get(commit.author.name)?.push(commit);
  });

  return {
    all,
    perAuthor: [...authorCommitMap.entries()].map(([author, commits]) => {
      const data = getWeeklyGroupedCommitCount(commits);
      return {
        author,
        total: data.reduce((sum, curr) => sum + curr.commits, 0),
        additions: commits.reduce(
          (sum, curr) => sum + curr.diff.reduce((adds, c) => adds + c.stats.total_additions, 0),
          0
        ),
        deletitions: commits.reduce(
          (sum, curr) => sum + curr.diff.reduce((dels, c) => dels + c.stats.total_deletions, 0),
          0
        ),
        data,
      };
    }),
  };
}

async function getCommitsInsights(username: string, repoName: string, branch: string): Promise<CommitsInsights> {
  const commits = await commitService.getCommitsWithDiff(username, repoName, branch);

  const commitWeeklyCount = new Map<string, number>();

  commits
    .sort((a, b) => moment(a.date).diff(moment(b.date), "milliseconds"))
    .forEach((commit) => {
      const week = moment(commit.date).startOf("week").format("DD.MM.yyyy.");
      commitWeeklyCount.set(week, (commitWeeklyCount?.get(week) ?? 0) + 1);
    });

  const commitDailyCount = new Map<string, number>();

  commits
    .sort((a, b) => moment(a.date).diff(moment(b.date), "milliseconds"))
    .filter((x) => {
      return moment().diff(moment(x.date), "days") < 7;
    })
    .forEach((commit) => {
      const date = moment(commit.date).startOf("day").format("DD.MM.yyyy.");
      commitDailyCount.set(date, (commitDailyCount?.get(date) ?? 0) + 1);
    });

  return {
    weekly: [...commitWeeklyCount.entries()].map(([week, commits]) => ({
      date: week,
      commits,
    })),
    daily: [...commitDailyCount.entries()].map(([date, commits]) => ({
      date,
      commits,
    })),
  };
}

async function getCodeFrequencyInsights(
  username: string,
  repoName: string,
  branch: string
): Promise<CodeFrequencyInsight[]> {
  const commits = await commitService.getCommitsWithDiff(username, repoName, branch);

  const commitWeeklyCountAdds = new Map<string, number>();
  const commitWeeklyCountDels = new Map<string, number>();

  const allWeeks: string[] = [];

  commits
    .sort((a, b) => moment(a.date).diff(moment(b.date), "milliseconds"))
    .forEach((commit) => {
      const week = moment(commit.date).startOf("week").format("DD.MM.yyyy.");
      allWeeks.push(week);

      commitWeeklyCountAdds.set(
        week,
        (commitWeeklyCountAdds?.get(week) ?? 0) +
          commits.reduce((sum, curr) => sum + curr.diff.reduce((adds, c) => adds + c.stats.total_additions, 0), 0)
      );
      commitWeeklyCountDels.set(
        week,
        (commitWeeklyCountDels?.get(week) ?? 0) +
          commits.reduce((sum, curr) => sum + curr.diff.reduce((adds, c) => adds + c.stats.total_deletions, 0), 0)
      );
    });

  return [...new Set(allWeeks)].map((week) => ({
    date: week,
    adds: commitWeeklyCountAdds.get(week) ?? 0,
    dels: -1 * (commitWeeklyCountDels.get(week) ?? 0),
  }));
}

function getWeeklyGroupedCommitCount(commits: Commit[]) {
  const commitWeeklyCount = new Map<string, number>();

  commits
    .sort((a, b) => moment(a.date).diff(moment(b.date), "milliseconds"))
    .forEach((commit) => {
      const week = moment(commit.date).startOf("week").format("DD.MM.yyyy.");
      commitWeeklyCount.set(week, (commitWeeklyCount?.get(week) ?? 0) + 1);
    });

  return [...commitWeeklyCount.entries()].map(([week, commits]) => ({
    date: week,
    commits,
  }));
}

export type InsightService = {
  getContributorInsights(username: string, repoName: string, branch: string): Promise<ContributorInsights>;
  getCommitsInsights(username: string, repoName: string, branch: string): Promise<CommitsInsights>;
  getCodeFrequencyInsights(username: string, repoName: string, branch: string): Promise<CodeFrequencyInsight[]>;
};

const insightService: InsightService = {
  getContributorInsights,
  getCommitsInsights,
  getCodeFrequencyInsights,
};

export { insightService };
