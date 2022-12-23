import { useQuery } from "react-query";
import { getMilestone, getRepositoryMilestones, searchRepositoryMilestones, type Milestone } from "./milestoneActions";

export function useMilestones(username: string, repo: string, open: boolean, dependencies: any[] = []) {
  const { data, error } = useQuery([`milestones_${username}/${repo}`, open, ...dependencies], () => getRepositoryMilestones(username, repo, open), {
    enabled: dependencies.reduce((acc, d) => acc && !d, true)
  });
  return {
    milestones: data?.data as Milestone[],
    error: (error as any)?.response?.data
  }
}

export function useSearchMilestones(username: string, repo: string, title: string, dependencies: any[] = []) {
  const { data, error } = useQuery([`milestones_${username}/${repo}`, title, ...dependencies], () => searchRepositoryMilestones(username, repo, title), {
    enabled: dependencies.reduce((acc, d) => acc && !d, true)
  });
  return {
    milestones: data?.data as Milestone[],
    error: (error as any)?.response?.data
  }
}

export function useMilestone(username: string, repo: string, localId: number, dependencies: any[] = []) {
  const { data, error } = useQuery([`milestones_${username}/${repo}/${localId}`, ...dependencies], () => getMilestone(username, repo, localId), {
    enabled: dependencies?.reduce((acc, dep) => acc && !dep, true)
  });
  return {
    milestone: data?.data as Milestone,
    error: (error as any)?.response?.data
  };
}
