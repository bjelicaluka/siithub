import axios from "axios";
import { useQuery } from "react-query";
import { type User } from "../user.model";

export function useUser(userId: User["_id"], dependencies: any[] = []) {
  const { data, error } = useQuery([userId, ...dependencies], () => axios.get(`/api/users/${userId}`), {
    enabled: dependencies?.reduce((acc, dep) => acc && !dep, true) && !!userId,
  });
  return {
    user: data?.data as User,
    error: (error as any)?.response?.data,
  };
}

export function useUserByUsername(username: string, dependencies: any[] = []) {
  const { data, error } = useQuery([username, ...dependencies], () => axios.get(`/api/users/by-username/${username}`), {
    enabled: dependencies?.reduce((acc, dep) => acc && !dep, true) && !!username,
  });
  return {
    user: data?.data as User,
    error: (error as any)?.response?.data,
  };
}
