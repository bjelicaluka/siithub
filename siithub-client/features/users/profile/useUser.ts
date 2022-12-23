import axios from "axios";
import { useQuery } from "react-query";
import { type User } from "../user.model";

export function useUser(userId: User["_id"], dependencies: any[] = []) {
  const { data } = useQuery([userId, ...dependencies], () => axios.get(`/api/users/${userId}`), {
    enabled: dependencies?.reduce((acc, dep) => acc && !dep, true)
  });

  return {
    user: data?.data,
  };
}
