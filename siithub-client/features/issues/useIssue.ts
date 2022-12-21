import { useQuery } from "react-query";
import { Issue, getIssue, getIssues, searchIssues } from "./issueActions";

export function useIssue(repositoryId: string, id: string, dependencies: any[] = []): { issue: Issue } {
  const { data } = useQuery([`issue_${repositoryId}_${id}`, ...dependencies], () => getIssue(repositoryId, id), {
    enabled: dependencies.reduce((acc, d) => acc && !d, true) && !!id
  });

  return {
    issue: data?.data
  }
}

export function useIssues(repositoryId: string, dependencies: any[] = []): { issues: Issue[] } {
  const { data } = useQuery([`issue_${repositoryId}`, ...dependencies], () => getIssues(repositoryId), {
    enabled: dependencies.reduce((acc, d) => acc && !d, true)
  });

  return {
    issues: data?.data
  }
}

export function useSearchIssues(params: any, repositoryId: string, dependencies: any[] = []): { issues: Issue[] } {
  const { data } = useQuery([`issue_${repositoryId}`, params, ...dependencies], () => searchIssues(params, repositoryId), {
    enabled: dependencies.reduce((acc, d) => acc && !d, true)
  });

  return {
    issues: data?.data
  }
}