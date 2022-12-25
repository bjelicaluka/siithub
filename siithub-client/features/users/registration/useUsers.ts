import { useQuery } from "react-query";
import { getUsers } from "./createUser";

export function useUsers(dependencies: any[] = []) {
  const { data } = useQuery([`users`, ...dependencies], () => getUsers(), {
    enabled: dependencies.reduce((acc, d) => acc && !d, true)
  });

  return {
    users: data?.data
  }
}