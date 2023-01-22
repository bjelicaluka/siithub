import { gitServerClient } from "../gitserver/gitserver.client";
import type { User } from "../user/user.model";
import { userService } from "../user/user.service";
import type { Commit, CommitWithDiff, LastCommitAndContrib } from "./commit.model";

async function getCommits(username: string, repoName: string, branch: string) {
  const commits: Commit[] = await gitServerClient.getCommits(username, repoName, branch);
  return await resolveAuthors(commits);
}

async function getCommitsBetweenBranches(username: string, repoName: string, base: string, compare: string) {
  const commits: Commit[] = await gitServerClient.getCommitsBetweenBranches(username, repoName, base, compare);
  return await resolveAuthors(commits);
}

async function getCommitsDiffBetweenBranches(username: string, repoName: string, base: string, compare: string) {
  const commit: Commit = await gitServerClient.getCommitsDiffBetweenBranches(username, repoName, base, compare);
  return (await resolveAuthors([commit]))[0];
}

async function getCommitsWithDiff(username: string, repoName: string, branch: string) {
  const commits: CommitWithDiff[] = await gitServerClient.getCommitsWithDiff(username, repoName, branch);
  return (await resolveAuthors(commits)) as CommitWithDiff[];
}

async function getCommitCount(username: string, repoName: string, branch: string) {
  return await gitServerClient.getCommitCount(username, repoName, branch);
}

async function getCommit(username: string, repoName: string, sha: string) {
  const commit: Commit = await gitServerClient.getCommit(username, repoName, sha);
  return (await resolveAuthors([commit]))[0];
}

async function mergeCommits(username: string, repoName: string, base: string, compare: string): Promise<any> {
  const mergeResult = await gitServerClient.mergeCommits(username, repoName, base, compare);
  return mergeResult;
}

async function getFileHistoryCommits(username: string, repoName: string, branch: string, filePath: string) {
  const commits: Commit[] = await gitServerClient.getFileHistoryCommits(username, repoName, branch, filePath);
  return await resolveAuthors(commits);
}

async function getFileInfo(username: string, repoName: string, branch: string, filePath: string) {
  const info: LastCommitAndContrib = await gitServerClient.getBlobInfo(username, repoName, branch, filePath);
  const users = await userService.findManyByEmails(info.contributors.map((c) => c.email));
  info.contributors = info.contributors.map((c) => users.find((user) => user.email === c.email) ?? c);
  info.author = users.find((user) => user.email === info.author.email) ?? info.author;
  return info;
}

async function resolveAuthors(commits: Commit[]): Promise<Commit[]> {
  const contributorsEmails = commits
    .map((c) => c.author?.email)
    .filter((value, index, array) => array.indexOf(value) === index);
  const users: { [email: string]: User } = (await userService.findManyByEmails(contributorsEmails)).reduce(
    (acc: any, user: User) => {
      acc[user.email] = user;
      return acc;
    },
    {}
  );
  commits.forEach((commit) => (commit.author = users[commit.author?.email] ?? commit.author));
  return commits;
}

export type CommitService = {
  getCommits(username: string, repoName: string, branch: string): Promise<Commit[]>;
  getCommitsBetweenBranches(username: string, repoName: string, base: string, compare: string): Promise<Commit[]>;
  getCommitsDiffBetweenBranches(username: string, repoName: string, base: string, compare: string): Promise<Commit>;
  getCommitsWithDiff(username: string, repoName: string, branch: string): Promise<CommitWithDiff[]>;
  getCommitCount(username: string, repoName: string, branch: string): Promise<{ count: number }>;
  getCommit(username: string, repoName: string, sha: string): Promise<Commit>;
  mergeCommits(username: string, repoName: string, base: string, compare: string): Promise<any>;
  getFileHistoryCommits(username: string, repoName: string, branch: string, filePath: string): Promise<Commit[]>;
  getFileInfo(username: string, repoName: string, branch: string, filePath: string): Promise<LastCommitAndContrib>;
};

const commitService: CommitService = {
  getCommits,
  getCommitsBetweenBranches,
  getCommitsDiffBetweenBranches,
  getCommitsWithDiff,
  getCommitCount,
  getCommit,
  mergeCommits,
  getFileHistoryCommits,
  getFileInfo,
};

export { commitService };
