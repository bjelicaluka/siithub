import { useQuery } from "react-query";
import { type Repository } from "../repository/repository.service";
import { type PullRequest, getPullRequest, getPullRequests } from "./pullRequestActions";

export function usePullRequest(repositoryId: Repository["_id"], localId: number, dependencies: any[] = []) {
  const { data, error } = useQuery(
    [`pull_request_${repositoryId}_${localId}`, ...dependencies],
    () => getPullRequest(repositoryId, localId),
    {
      enabled: dependencies.reduce((acc, d) => acc && !d, true) && !!localId,
    }
  );

  return {
    pullRequest: data?.data as PullRequest,
    error: (error as any)?.response?.data,
  };
}

export function usePullRequests(repositoryId: Repository["_id"], dependencies: any[] = []) {
  const { data, error } = useQuery(
    [`pull_requests_${repositoryId}`, ...dependencies],
    () => getPullRequests(repositoryId),
    {
      enabled: dependencies.reduce((acc, d) => acc && !d, true),
    }
  );

  return {
    pullRequests: data?.data as PullRequest[],
    error: (error as any)?.response?.data,
  };
}
