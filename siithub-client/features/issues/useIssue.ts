import { useQuery } from "react-query";
import { type Issue, type IssuesQuery, getIssue, getIssues, searchIssues } from "./issueActions";
import { type Repository } from "../repository/repository.service";

export function useIssue(repositoryId: Repository["_id"], id: Issue["_id"], dependencies: any[] = []): { issue: Issue } {
  const { data } = useQuery([`issue_${repositoryId}_${id}`, ...dependencies], () => getIssue(repositoryId, id), {
    enabled: dependencies.reduce((acc, d) => acc && !d, true) && !!id
  });

  return {
    issue: data?.data
  }
}

export function useIssues(repositoryId: Repository["_id"], dependencies: any[] = []): { issues: Issue[] } {
  const { data } = useQuery([`issue_${repositoryId}`, ...dependencies], () => getIssues(repositoryId), {
    enabled: dependencies.reduce((acc, d) => acc && !d, true)
  });

  return {
    issues: data?.data
  }
}

export function useSearchIssues(query: IssuesQuery, repositoryId: Repository["_id"], dependencies: any[] = []): { issues: Issue[] } {
  const { data } = useQuery([`issue_${repositoryId}`, query, ...dependencies], () => searchIssues(query, repositoryId), {
    enabled: dependencies.reduce((acc, d) => acc && !d, true)
  });

  return {
    issues: data?.data
  }
}