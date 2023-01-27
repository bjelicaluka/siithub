import { useQuery } from "react-query";
import { getUsers } from "./createUser";

export function useUsers(dependencies: any[] = [], preventDefaultEnabled: boolean = false) {
  const { data } = useQuery([`users`, ...dependencies], () => getUsers(), {
    enabled: preventDefaultEnabled || dependencies.reduce((acc, d) => acc && !d, true),
  });

  return {
    users: data?.data,
  };
}
