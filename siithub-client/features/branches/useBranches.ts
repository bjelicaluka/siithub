import { useQuery } from "react-query";
import { type Branch, type DefaultBranch, getBranches, getBranchesCount, getDefaultBranch } from "./branchesActions";

export function useBranches(username: string, repoName: string, name?: string, dependencies: any[] = []) {
  const { data }: { data: any } = useQuery(
    [`${username}/${repoName}_branches_get_${name}`, name, ...dependencies],
    () => getBranches(username, repoName, name),
    { enabled: dependencies.reduce((acc, d) => acc && !d, true) }
  );

  return {
    branches: (data?.data ?? []) as Branch[],
  };
}

export function useDefaultBranch(username: string, repoName: string, dependencies: any[] = []) {
  const { data, error } = useQuery(
    [`${username}/${repoName}_default_branch`, ...dependencies],
    () => getDefaultBranch(username, repoName),
    { enabled: dependencies.reduce((acc, d) => acc && !d, true) }
  );

  return {
    defaultBranch: (data?.data ?? {}) as DefaultBranch,
    error: (error as any)?.response?.data,
  };
}

export function useBranchesCount(username: string, repoName: string, dependencies: any[] = []) {
  const { data }: { data: any } = useQuery(
    [`${username}/${repoName}_branches_count`, ...dependencies],
    () => getBranchesCount(username, repoName),
    { enabled: dependencies.reduce((acc, d) => acc && !d, true) }
  );

  return (data?.data ?? { count: 0 }) as { count: number };
}
