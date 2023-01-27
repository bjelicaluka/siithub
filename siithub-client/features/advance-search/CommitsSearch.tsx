import { type FC } from "react";
import { type Repository } from "../repository/repository.service";
import { type Commit } from "../commits/useCommits";
import { useSearch } from "./useAdvanceSearch";
import { CommitCard } from "../commits/CommitCard";

type CommitsSearchProps = { param: string; repositoryId: Repository["_id"]; sort?: any };
export const CommitsSearch: FC<CommitsSearchProps> = ({ param, repositoryId, sort }) => {
  const {
    data: { commits, repository },
  } = useSearch("commits", param, repositoryId, sort) as any;

  return (
    <div>
      {commits?.map((c: Commit) => {
        return <CommitCard key={c.sha} commit={c} username={repository.owner} repoName={repository.name} />;
      })}
    </div>
  );
};
