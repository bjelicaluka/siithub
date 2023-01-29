import { useQuery } from "react-query";
import {
  findFork,
  getForks,
  getRepository,
  getStarredRepositories,
  getUsersRepositories,
  Repository,
  searchRepositories,
} from "./repository.service";

export function useSearchRepositories(username: string | undefined, term: string, dependencies: any[] = []) {
  const { data, error } = useQuery(
    [`repositories_${username}/${term}`, ...dependencies],
    () => searchRepositories(username ?? "", term),
    {
      enabled: !!username && dependencies.reduce((acc, d) => acc && !d, true),
    }
  );
  return {
    repositories: (data?.data ?? []) as Repository[],
    error: (error as any)?.response?.data,
  };
}

export function useRepository(owner: string, name: string, dependencies: any[] = []) {
  const { data, error } = useQuery([`repository_${owner}/${name}`, ...dependencies], () => getRepository(owner, name), {
    enabled: dependencies.reduce((acc, d) => acc && !d, true),
  });
  return {
    repository: data?.data as Repository,
    error: (error as any)?.response?.data,
  };
}

export function useStarredRepositories(username: string, dependencies: any[] = []) {
  const { data, error } = useQuery(
    [`starred_repos_${username}`, ...dependencies],
    () => getStarredRepositories(username),
    {
      enabled: dependencies.reduce((acc, d) => acc && !d, true),
    }
  );
  return {
    repositories: data?.data as Repository[],
    error: (error as any)?.response?.data,
  };
}

export function useFork(username: string, repo: string, forkOwner: string, dependencies: any[] = []) {
  const { data, error } = useQuery(
    [`fork_${username}/${repo}/${forkOwner}`, ...dependencies],
    () => findFork(username, repo, forkOwner),
    {
      enabled: dependencies.reduce((acc, d) => acc && !d, true),
    }
  );
  return {
    fork: data?.data as Repository,
    error: (error as any)?.response?.data,
  };
}

export function useForks(username: string, repo: string, dependencies: any[] = []) {
  const { data, error } = useQuery([`forks_${username}/${repo}`, ...dependencies], () => getForks(username, repo), {
    enabled: dependencies.reduce((acc, d) => acc && !d, true),
  });
  return {
    forks: data?.data as Repository[],
    error: (error as any)?.response?.data,
  };
}

export function useUsersRepositories(username: string, dependencies: any[] = []) {
  const { data, error } = useQuery([`repos_${username}`, ...dependencies], () => getUsersRepositories(username), {
    enabled: dependencies.reduce((acc, d) => acc && !d, true),
  });
  return {
    repositories: data?.data as Repository[],
    error: (error as any)?.response?.data,
  };
}
