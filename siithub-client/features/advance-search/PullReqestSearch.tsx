import { type FC } from "react";
import { type Repository } from "../repository/repository.service";
import { type PullRequest } from "../pull-requests/pullRequestActions";
import { useSearch } from "./useAdvanceSearch";
import { PullRequestCard } from "./PullRequestCard";

type PullRequestsSearchProps = { param: string; repositoryId: Repository["_id"]; sort?: any };

export const PullRequestsSearch: FC<PullRequestsSearchProps> = ({ param, repositoryId, sort }) => {
  const {
    data: { requests, repository },
  } = useSearch("pull-requests", param, repositoryId, sort) as any;

  return (
    <div>
      {requests?.map((pr: PullRequest) => {
        return <PullRequestCard key={pr._id} request={pr} username={repository.owner} repoName={repository.name} />;
      })}
    </div>
  );
};
