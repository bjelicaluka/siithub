import { useQuery } from "react-query";
import { Repository, searchRepositories } from "./repository.service";

export function useSearchRepositories(
  username: string | undefined,
  term: string,
  dependencies: any[] = []
) {
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
