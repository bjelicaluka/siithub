import { useQuery } from "react-query";
import { type Repository } from "../repository/repository.service";
import { getCount, getSearch } from "./advanceSearchActions";

export function useSearch<T>(type: string, param: string, repositoryId?: Repository["_id"], sort?: any) {
  const { data, error } = useQuery([`search_${type}_${param}_${repositoryId}_${sort}`], () =>
    getSearch<T>(type, param, repositoryId, sort)
  );
  return {
    data: (data?.data as T[]) ?? [],
    error: (error as any)?.response?.data,
  };
}
export function useCount(type: string, param: string, repositoryId?: Repository["_id"]) {
  const { data, error } = useQuery(
    [`count_${type}_${param}_${repositoryId}`],
    () => getCount(type, param, repositoryId),
    {
      enabled: (type !== "commits" && type !== "pull-requests") || !!repositoryId,
    }
  );
  return {
    data: data?.data.count as number,
    error: (error as any)?.response?.data,
  };
}
