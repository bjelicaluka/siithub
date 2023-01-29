import { useQuery } from "react-query";
import { type Tag, getTagsCountByRepo, searchTagsInRepo } from "./tagActions";

export function useTags(owner: string, name: string, dependencies: any[] = []) {
  return useSearchTags(owner, name, "", dependencies);
}

export function useSearchTags(owner: string, name: string, tagName: string, dependencies: any[] = []) {
  const { data } = useQuery(
    [`tags_${owner}_${name}_${tagName}`, name, tagName, ...dependencies],
    () => searchTagsInRepo(owner, name, tagName),
    {
      enabled: dependencies.reduce((acc, d) => acc && !d, true) && !!owner && !!name,
    }
  );

  return {
    tags: (data?.data ?? []) as Tag[],
  };
}

export function useTagsCount(owner: string, name: string) {
  const { data } = useQuery([`tags_${owner}_${name}_count`, name], () => getTagsCountByRepo(owner, name), {
    enabled: !!owner && !!name,
  });

  return {
    count: data?.data?.count ?? 0,
  };
}
