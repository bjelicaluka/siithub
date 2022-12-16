import { useQuery } from "react-query";
import { getRepositoryLabels } from "./labelActions";

export function useLabels(repositoryId: string, dependencies: any[] = []) {
  const { data } = useQuery([`labels_${repositoryId}`, ...dependencies], () => getRepositoryLabels(repositoryId), {
    enabled: dependencies.reduce((acc, d) => acc && !d, true)
  });

  return {
    labels: data?.data
  }
}