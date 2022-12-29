import { useQuery } from "react-query";
import { searchCollaborators } from "./collaboratorAction";

export function useCollaborators(
  username: string,
  repo: string,
  name: string,
  dependencies: any[] = []
) {
  const { data } = useQuery(
    [`collaborators_${username}/${repo}`, name, ...dependencies],
    () => searchCollaborators(username, repo, name),
    { enabled: dependencies.reduce((acc, d) => acc && !d, true) }
  );

  return {
    collaborators: data?.data,
  };
}
