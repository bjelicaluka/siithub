import axios from "axios";
import { useQuery } from "react-query";
import { type Repository } from "../repository/repository.service";

export function useMilestonesByRepoId(repositoryId: Repository["_id"], dependencies: any[] = []) {
  const { data } = useQuery([`milestones_${repositoryId}`, ...dependencies], () => axios.get(`/api/repositories/${repositoryId}/milestones`), {
    enabled: dependencies.reduce((acc, d) => acc && !d, true) && !!repositoryId
  });

  return {
    milestones: data?.data
  }
}