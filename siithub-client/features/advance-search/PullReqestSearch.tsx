import { type FC } from "react";
import { type Repository } from "../repository/repository.service";
import { type PullRequestWithRepository } from "../pull-requests/pullRequestActions";
import { useSearch } from "./useAdvanceSearch";
import { PullRequestCard } from "./PullRequestCard";

type PullRequestsSearchProps = { param: string; repositoryId: Repository["_id"]; sort?: any };

export const PullRequestsSearch: FC<PullRequestsSearchProps> = ({ param, repositoryId, sort }) => {
  const { data: pullRequests } = useSearch("pull-requests", param, repositoryId, sort) as any;

  return (
    <div className="mt-2">
      {pullRequests?.map((pr: PullRequestWithRepository) => {
        return (
          <div className="mt-1" key={pr._id}>
            <PullRequestCard pullRequest={pr} />
          </div>
        );
      })}
    </div>
  );
};
