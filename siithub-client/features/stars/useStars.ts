import { useQuery } from "react-query";
import { User } from "../users/user.model";
import { getStar, getStargazers } from "./starActions";

export function useStar(username: string, repo: string, dependencies: any[] = []) {
  const { data, error } = useQuery([`stars_${username}/${repo}`, ...dependencies], () => getStar(username, repo), {
    enabled: dependencies?.reduce((acc, dep) => acc && !dep, true),
  });
  return {
    star: data?.data as { date: Date },
    error: (error as any)?.response?.data,
  };
}

export function useStargazers(username: string, repo: string, dependencies: any[] = []) {
  const { data, error } = useQuery(
    [`stargazers_${username}/${repo}`, ...dependencies],
    () => getStargazers(username, repo),
    {
      enabled: dependencies?.reduce((acc, dep) => acc && !dep, true),
    }
  );
  return {
    users: data?.data as User[],
    error: (error as any)?.response?.data,
  };
}
