import axios from "axios";
import { useQuery } from "react-query";

type Commit = {
  message: string;
  sha: string;
  date: string;
  author: string;
};

export function useCommits(username: string, repoName: string, branch: string, dependencies: any[] = []) {
  const { data, error, isLoading } = useQuery(
    [`commits_${username}/${repoName}/${branch}`, ...dependencies],
    () => axios.get(`/api/${username}/${repoName}/commits/${encodeURIComponent(branch)}`),
    {
      enabled: dependencies.reduce((acc, d) => acc && !d, true),
    }
  );
  return {
    commits: data?.data as Commit[],
    error: (error as any)?.response?.data,
    isLoading: isLoading,
  };
}

export function useCommitCount(username: string, repoName: string, branch: string, dependencies: any[] = []) {
  const { data, error, isLoading } = useQuery(
    [`commit-count_${username}/${repoName}/${branch}`, ...dependencies],
    () => axios.get(`/api/${username}/${repoName}/commit-count/${encodeURIComponent(branch)}`),
    {
      enabled: dependencies.reduce((acc, d) => acc && !d, true),
    }
  );
  return {
    count: data?.data?.count as number,
    error: (error as any)?.response?.data,
    isLoading: isLoading,
  };
}

type CommitWithDiff = Commit & {
  diff: { old: { path: string; content: string | undefined }; new: { path: string; content: string | undefined } }[];
};

export function useCommit(username: string, repoName: string, sha: string, dependencies: any[] = []) {
  const { data, error, isLoading } = useQuery(
    [`commit_${username}/${repoName}/${sha}`, ...dependencies],
    () => axios.get(`/api/${username}/${repoName}/commit/${sha}`),
    {
      enabled: dependencies.reduce((acc, d) => acc && !d, true),
    }
  );
  return {
    commit: data?.data as CommitWithDiff,
    error: (error as any)?.response?.data,
    isLoading: isLoading,
  };
}
