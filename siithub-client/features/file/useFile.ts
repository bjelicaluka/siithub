import axios from "axios";
import { useQuery } from "react-query";

export function useFile(
  username: string,
  repoName: string,
  branch: string,
  blobPath: string,
  dependencies: any[] = []
) {
  const { data, error, isLoading } = useQuery(
    [`blob_${username}/${repoName}/${branch}/${blobPath}`, ...dependencies],
    async () => {
      const res = await axios.get(
        `/api/${username}/${repoName}/blob/${encodeURIComponent(branch)}/${encodeURIComponent(blobPath)}`,
        {
          responseType: "blob",
          headers: {},
        }
      );
      const isBinary = res?.headers["bin"] === "1";
      const size = +(res?.headers["size"] ?? 0);
      const text = isBinary ? "" : await new Response(res.data).text();

      return {
        isBinary,
        size,
        content: isBinary ? res.data : text,
      };
    },
    {
      enabled: dependencies.reduce((acc, d) => acc && !d, true),
    }
  );
  return {
    ...data,
    error: (error as any)?.response?.data,
    isLoading: isLoading,
  };
}
