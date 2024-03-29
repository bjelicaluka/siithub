import axios from "axios";
import { useQuery } from "react-query";

type Commit = {
  message: string;
  sha: string;
  date: string;
  author: string;
};

type TreeEntry = {
  name: string;
  path: string;
  isFolder: boolean;
  commit: Commit;
};

export function useTree(
  username: string,
  repoName: string,
  branch: string,
  treePath: string,
  dependencies: any[] = []
) {
  const { data, error, isLoading } = useQuery(
    [`tree_${username}/${repoName}/${branch}/${treePath}`, ...dependencies],
    () => axios.get(`/api/${username}/${repoName}/tree/${encodeURIComponent(branch)}/${encodeURIComponent(treePath)}`),
    {
      enabled: dependencies.reduce((acc, d) => acc && !d, true),
    }
  );
  return {
    treeEntries: (data?.data as TreeEntry[])?.sort((x, y) => (x.isFolder === y.isFolder ? 0 : x.isFolder ? -1 : 1)),
    error: (error as any)?.response?.data,
    isLoading: isLoading,
  };
}
