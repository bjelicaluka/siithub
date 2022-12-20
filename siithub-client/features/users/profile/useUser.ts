import axios from "axios";
import { useQuery } from "react-query";

export function useUser(userId: string, dependencies: any[] = []) {
  const { data } = useQuery([userId, ...dependencies], () => axios.get(`/api/users/${userId}`), {
    enabled: dependencies?.reduce((acc, dep) => acc && !dep, true)
  });

  return {
    user: data?.data,
  };
}
