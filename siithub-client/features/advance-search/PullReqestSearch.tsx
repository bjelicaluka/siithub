import { type FC } from "react";
import { type Repository } from "../repository/repository.service";
import { type PullRequest } from "../pull-requests/pullRequestActions";
import { useSearch } from "./useAdvanceSearch";
import { PullRequestCard } from "./PullRequestCard";

type PullRequestsSearchProps = { param: string; repositoryId: Repository["_id"] };

export const PullRequestsSearch: FC<PullRequestsSearchProps> = ({ param, repositoryId }) => {
  const {
    data: { requests, repository },
  } = useSearch("pull-requests", param, repositoryId) as any;

  return (
    <div>
      {requests?.map((pr: PullRequest) => {
        return <PullRequestCard key={pr._id} request={pr} username={repository.owner} repoName={repository.name} />;
      })}
    </div>
  );
};
