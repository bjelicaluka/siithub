import { type FC } from "react";
import { type Repository } from "../repository/repository.service";
import { useCommitsBetweenBranches } from "../commits/useCommits";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { usePullRequestContext } from "./PullRequestContext";
import { CommitsHistory } from "../commits/CommitsTable";

type PullRequestCommitsPageProps = {
  repositoryId: Repository["_id"];
  pullRequestId: number;
};

export const PullRequestCommitsPage: FC<PullRequestCommitsPageProps> = ({ repositoryId, pullRequestId }) => {
  const { pullRequest } = usePullRequestContext();
  const { repository }: any = useRepositoryContext();
  const { owner, name } = repository as Repository;

  const { commits } = useCommitsBetweenBranches(owner, name, pullRequest.csm.base, pullRequest.csm.compare, [
    pullRequest.csm.base,
    pullRequest.csm.compare,
  ]);

  return (
    <> {commits && commits.length ? <CommitsHistory username={owner} repoName={name} commits={commits} /> : <></>} </>
  );
};
