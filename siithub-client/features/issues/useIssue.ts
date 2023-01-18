import { useQuery } from "react-query";
import { type Issue, type IssuesQuery, getIssue, getIssues, searchIssues } from "./issueActions";
import { type Repository } from "../repository/repository.service";

export function useIssue(repositoryId: Repository["_id"], localId: number, dependencies: any[] = []) {
  const { data, error } = useQuery(
    [`issue_${repositoryId}_${localId}`, ...dependencies],
    () => getIssue(repositoryId, localId),
    {
      enabled: dependencies.reduce((acc, d) => acc && !d, true) && !!localId,
    }
  );

  return {
    issue: data?.data as Issue,
    error: (error as any)?.response?.data,
  };
}

export function useIssues(repositoryId: Repository["_id"], dependencies: any[] = []) {
  const { data, error } = useQuery([`issue_${repositoryId}`, ...dependencies], () => getIssues(repositoryId), {
    enabled: dependencies.reduce((acc, d) => acc && !d, true),
  });

  return {
    issues: data?.data as Issue[],
    error: (error as any)?.response?.data,
  };
}

export function useSearchIssues(query: IssuesQuery, repositoryId: Repository["_id"], dependencies: any[] = []) {
  const { data, error } = useQuery(
    [`issue_${repositoryId}`, query, ...dependencies],
    () => searchIssues(query, repositoryId),
    {
      enabled: dependencies.reduce((acc, d) => acc && !d, true),
    }
  );

  return {
    issues: data?.data as Issue[],
    error: (error as any)?.response?.data,
  };
}
