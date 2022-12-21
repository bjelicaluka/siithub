import { useQuery } from "react-query";
import { getRepositoryLabels } from "./labelActions";

export function useLabels(repositoryId: string, dependencies: any[] = []) {
  return useSearchLabels(repositoryId, '', dependencies);
}

export function useSearchLabels(repositoryId: string, name: string, dependencies: any[] = []) {
  const { data } = useQuery([`labels_${repositoryId}`, name, ...dependencies], () => getRepositoryLabels(repositoryId, name), {
    enabled: dependencies.reduce((acc, d) => acc && !d, true)
  });

  return {
    labels: data?.data
  }
}