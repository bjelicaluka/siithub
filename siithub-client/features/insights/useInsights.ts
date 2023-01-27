import axios from "axios";
import { useQuery } from "react-query";

export type PulseInsights = {
  totalPrs: number;
  activePrs: number;
  mergedPrs: number;
  totalIssues: number;
  closedIssues: number;
  newIssues: number;
};

export function usePulseInsights(username: string, repoName: string, dependencies: any[] = []) {
  const { data, error, isLoading } = useQuery(
    [`contributor_insights${username}/${repoName}`, ...dependencies],
    () => axios.get(`/api/${username}/${repoName}/insights/pulse`),
    {
      enabled: dependencies.reduce((acc, d) => acc && !!d, true),
    }
  );
  return {
    insights: data?.data as PulseInsights,
    error: (error as any)?.response?.data,
    isLoading: isLoading,
  };
}

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

export function useContributorInsights(username: string, repoName: string, branch: string, dependencies: any[] = []) {
  const { data, error, isLoading } = useQuery(
    [`contributor_insights${username}/${repoName}/${branch}`, ...dependencies],
    () => axios.get(`/api/${username}/${repoName}/insights/contributors/${encodeURIComponent(branch)}`),
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
    () => axios.get(`/api/${username}/${repoName}/insights/commits/${encodeURIComponent(branch)}`),
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
    () => axios.get(`/api/${username}/${repoName}/insights/frequency/${encodeURIComponent(branch)}`),
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
