import { useQuery } from "react-query";
import { getRepositoryLabels } from "./labelActions";
import { type Repository } from "../repository/repository.service";

export function useLabels(repositoryId: Repository["_id"], dependencies: any[] = []) {
  return useSearchLabels(repositoryId, '', dependencies);
}

export function useSearchLabels(repositoryId: Repository["_id"], name: string, dependencies: any[] = []) {
  const { data } = useQuery([`labels_${repositoryId}`, name, ...dependencies], () => getRepositoryLabels(repositoryId, name), {
    enabled: dependencies.reduce((acc, d) => acc && !d, true) && !!repositoryId
  });

  return {
    labels: data?.data
  }
}