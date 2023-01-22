import axios from "axios";
import { useQuery } from "react-query";

export function usePulseInsights() {
  return {
    totalPrs: 8,
    activePrs: 5,
    mergedPrs: 4,

    totalIssues: 8,
    closedIssues: 5,
    newIssues: 4,
  };
}

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

export function useContributorInsights(username: string, repoName: string, branch: string, dependencies: any[] = []) {
  const { data, error, isLoading } = useQuery(
    [`contributor_insights${username}/${repoName}/${branch}`, ...dependencies],
    () => axios.get(`/api/insights/${username}/${repoName}/commits/${encodeURIComponent(branch)}/contributors`),
    {
      enabled: dependencies.reduce((acc, d) => acc && !!d, true),
    }
  );
  return {
    insights: data?.data as ContributorInsights,
    error: (error as any)?.response?.data,
    isLoading: isLoading,
  };
}

export type CommitsInsights = {
  weekly: GroupedCommitCount[];
  daily: GroupedCommitCount[];
};

export function useCommitsInsights(username: string, repoName: string, branch: string, dependencies: any[] = []) {
  const { data, error, isLoading } = useQuery(
    [`commits_insights${username}/${repoName}/${branch}`, ...dependencies],
    () => axios.get(`/api/insights/${username}/${repoName}/commits/${encodeURIComponent(branch)}/commits`),
    {
      enabled: dependencies.reduce((acc, d) => acc && !!d, true),
    }
  );
  return {
    insights: data?.data as CommitsInsights,
    error: (error as any)?.response?.data,
    isLoading: isLoading,
  };
}

export type CodeFrequencyInsight = {
  date: string;
  adds: number;
  dels: number;
};

export function useCodeFrequencyInsights(username: string, repoName: string, branch: string, dependencies: any[] = []) {
  const { data, error, isLoading } = useQuery(
    [`code_frequency_insights${username}/${repoName}/${branch}`, ...dependencies],
    () => axios.get(`/api/insights/${username}/${repoName}/commits/${encodeURIComponent(branch)}/frequency`),
    {
      enabled: dependencies.reduce((acc, d) => acc && !!d, true),
    }
  );
  return {
    insights: data?.data as CodeFrequencyInsight[],
    error: (error as any)?.response?.data,
    isLoading: isLoading,
  };
}
