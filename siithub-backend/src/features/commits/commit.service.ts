import { gitServerClient } from "../gitserver/gitserver.client";
import { userService } from "../user/user.service";
import { Commit, LastCommitAndContrib } from "./commit.model";

async function getCommits(username: string, repoName: string, branch: string) {
  const commits: Commit[] = await gitServerClient.getCommits(username, repoName, branch);
  return await resolveAuthors(commits);
}

async function getCommitCount(username: string, repoName: string, branch: string) {
  return await gitServerClient.getCommitCount(username, repoName, branch);
}

async function getCommit(username: string, repoName: string, sha: string) {
  const commit: Commit = await gitServerClient.getCommit(username, repoName, sha);
  return (await resolveAuthors([commit]))[0];
}

async function getFileHistoryCommits(username: string, repoName: string, branch: string, filePath: string) {
  const commits: Commit[] = await gitServerClient.getFileHistoryCommits(username, repoName, branch, filePath);
  return await resolveAuthors(commits);
}

async function getFileInfo(username: string, repoName: string, branch: string, filePath: string) {
  const info: LastCommitAndContrib = await gitServerClient.getBlobInfo(username, repoName, branch, filePath);
  const users = await userService.findManyByEmails(info.contributors.map((c) => c.email));
  info.contributors = info.contributors.map((c) => users.find((user) => user.email === c.email) ?? c);
  return info;
}

async function resolveAuthors(commits: Commit[]): Promise<Commit[]> {
  const contributorsEmails = commits
    .map((c) => c.author.email)
    .filter((value, index, array) => array.indexOf(value) === index);
  const users = await userService.findManyByEmails(contributorsEmails);
  commits.forEach(
    (commit) => (commit.author = users.find((user) => user.email === commit.author.email) ?? commit.author)
  );
  return commits;
}

export type CommitService = {
  getCommits(username: string, repoName: string, branch: string): Promise<Commit[]>;
  getCommitCount(username: string, repoName: string, branch: string): Promise<{ count: number }>;
  getCommit(username: string, repoName: string, sha: string): Promise<Commit>;
  getFileHistoryCommits(username: string, repoName: string, branch: string, filePath: string): Promise<Commit[]>;
  getFileInfo(username: string, repoName: string, branch: string, filePath: string): Promise<LastCommitAndContrib>;
};

const commitService: CommitService = {
  getCommits,
  getCommitCount,
  getCommit,
  getFileHistoryCommits,
  getFileInfo,
};

export { commitService };
