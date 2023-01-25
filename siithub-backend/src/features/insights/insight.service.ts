import moment from "moment";
import { commitService } from "../commits/commit.service";
import type { CommitWithDiff } from "../commits/commit.model";
import type { CodeFrequencyInsight, CommitsInsights, ContributorInsights } from "./insight.model";
import { pullRequestService } from "../pull-requests/pull-requests.service";
import { repositoryService } from "../repository/repository.service";
import { MissingEntityException } from "../../error-handling/errors";
import { issueService } from "../issue/issue.service";
import { IssueState } from "../issue/issue.model";

type PulseInsights = {
  totalPrs: number;
  activePrs: number;
  mergedPrs: number;
  totalIssues: number;
  closedIssues: number;
  newIssues: number;
};

async function getPulseInsights(username: string, repoName: string): Promise<PulseInsights> {
  const repo = await repositoryService.findByOwnerAndName(username, repoName);
  if (!repo) throw new MissingEntityException("Repo not found.");

  const allPullRequests = await pullRequestService.findByRepositoryId(repo._id);
  const allIssues = await issueService.findByRepositoryId(repo._id);

  const totalPrs = allPullRequests.length;
  const activePrs = allPullRequests.filter((x) => !x.csm.isClosed).length;

  return {
    totalPrs,
    activePrs,
    mergedPrs: totalPrs - activePrs,

    totalIssues: allIssues.length,
    closedIssues: allIssues.filter((x) => x.csm.state === IssueState.Closed).length,
    newIssues: allIssues.filter((x) => x.csm.state === IssueState.Open).length,
  };
}

async function getContributorInsights(
  username: string,
  repoName: string,
  branch: string
): Promise<ContributorInsights> {
  const commits = (await commitService.resolveAuthors(
    await commitService.getCommitsWithDiff(username, repoName, branch)
  )) as CommitWithDiff[];

  const all = getDailyGroupedCount(commits);
  const startDate = new Date(all.at(0)?.date ?? "");
  const endDate = new Date(all.at(-1)?.date ?? "");

  const authorCommitMap = new Map<string, CommitWithDiff[]>();

  commits.forEach((commit) => {
    if (!commit.stats.files) return;
    if (!authorCommitMap.has(commit.author.email)) authorCommitMap.set(commit.author.email, [commit]);
    else authorCommitMap.get(commit.author.email)?.push(commit);
  });

  const perAuthor = [...authorCommitMap.entries()].map(([email, authorCommits]) => {
    const data = getDailyGroupedCount(authorCommits, startDate, endDate);

    const a = data.reduce(
      (prev, curr) => {
        prev.commitsTotal += curr.commits;
        prev.maxCommits = Math.max(prev.maxCommits, curr.commits);
        prev.addsTotal += curr.adds;
        prev.maxAdds = Math.max(prev.maxAdds, curr.adds);
        prev.delsTotal += curr.dels;
        prev.maxDels = Math.max(prev.maxDels, curr.dels);
        return prev;
      },
      { commitsTotal: 0, maxCommits: 0, addsTotal: 0, maxAdds: 0, delsTotal: 0, maxDels: 0 }
    );

    return { author: authorCommits[0].author, data, ...a };
  });

  const authorDataMax = perAuthor
    .sort((a, b) => b.commitsTotal - a.commitsTotal)
    .reduce(
      (prev, curr) => {
        prev.commits = Math.max(prev.commits, curr.maxCommits);
        prev.adds = Math.max(prev.adds, curr.maxAdds);
        prev.dels = Math.max(prev.dels, curr.maxDels);
        return prev;
      },
      { commits: 0, adds: 0, dels: 0 }
    );

  return { all, authorDataMax, perAuthor };
}

async function getCommitsInsights(username: string, repoName: string, branch: string): Promise<CommitsInsights> {
  const commits = await commitService.getCommitsWithDiff(username, repoName, branch);

  const startDate = new Date(commits.at(-1)?.date ?? "");
  const endDate = new Date(commits.at(0)?.date ?? "");
  const allWeeks = datesBetween(startDate, endDate, true).map((d) => moment(d).format("yyyy-MM-DD"));
  const dates = datesBetween(startDate, endDate).map((d) => moment(d).format("yyyy-MM-DD"));

  const commitWeeklyCount = new Map<string, number>();
  const commitDailyCount = new Map<string, number>();

  commits.forEach((commit) => {
    const week = moment(commit.date).startOf("week").format("yyyy-MM-DD");
    commitWeeklyCount.set(week, (commitWeeklyCount?.get(week) ?? 0) + 1);

    const date = moment(commit.date).format("yyyy-MM-DD");
    commitDailyCount.set(date, (commitDailyCount?.get(date) ?? 0) + 1);
  });

  return {
    weekly: allWeeks.map((week) => ({
      date: week,
      commits: commitWeeklyCount.get(week) ?? 0,
    })),
    daily: dates.map((date) => ({
      date,
      commits: commitDailyCount.get(date) ?? 0,
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

  const allWeeks = datesBetween(new Date(commits.at(-1)?.date ?? ""), new Date(commits.at(0)?.date ?? ""), true).map(
    (d) => moment(d).format("yyyy-MM-DD")
  );

  commits.forEach((commit) => {
    const week = moment(commit.date).startOf("week").format("yyyy-MM-DD");
    commitWeeklyCountAdds.set(week, (commitWeeklyCountAdds?.get(week) ?? 0) + commit.stats.add);
    commitWeeklyCountDels.set(week, (commitWeeklyCountDels?.get(week) ?? 0) + commit.stats.del);
  });

  return allWeeks.map((week) => ({
    date: week,
    adds: commitWeeklyCountAdds.get(week) ?? 0,
    dels: -(commitWeeklyCountDels.get(week) ?? 0),
  }));
}

function getDailyGroupedCount(commits: CommitWithDiff[], startDate?: Date, endDate?: Date) {
  const dailyCount = new Map<string, { adds: number; dels: number; commits: number }>();

  const dates = datesBetween(
    startDate || new Date(commits.at(-1)?.date ?? ""),
    endDate || new Date(commits.at(0)?.date ?? "")
  ).map((d) => moment(d).format("yyyy-MM-DD"));

  commits.forEach((commit) => {
    const dateStr = moment(commit.date).format("yyyy-MM-DD");
    const count = dailyCount.get(dateStr) ?? { adds: 0, dels: 0, commits: 0 };
    count.adds = count.adds + commit.stats.add;
    count.dels = count.dels + commit.stats.del;
    count.commits++;
    dailyCount.set(dateStr, count);
  });

  return dates.map((date) => ({
    date,
    ...(dailyCount.get(date) ?? { adds: 0, dels: 0, commits: 0 }),
  }));
}

function datesBetween(startDate: Date, endDate: Date, onlyWeekStarts = false) {
  const dates = [];
  let currentDate = new Date(startDate);
  if (onlyWeekStarts) currentDate.setDate(currentDate.getDate() - currentDate.getDay());
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + (onlyWeekStarts ? 7 : 1));
  }
  return dates;
}

export type InsightService = {
  getPulseInsights(username: string, repoName: string): Promise<PulseInsights>;
  getContributorInsights(username: string, repoName: string, branch: string): Promise<ContributorInsights>;
  getCommitsInsights(username: string, repoName: string, branch: string): Promise<CommitsInsights>;
  getCodeFrequencyInsights(username: string, repoName: string, branch: string): Promise<CodeFrequencyInsight[]>;
};

const insightService: InsightService = {
  getPulseInsights,
  getContributorInsights,
  getCommitsInsights,
  getCodeFrequencyInsights,
};

export { insightService };
