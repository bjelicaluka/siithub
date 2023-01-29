import { type FC, useEffect } from "react";
import { type Repository } from "../repository/repository.service";
import { DefinePullRequestForm } from "./DefinePullRequestForm";
import { initialPullRequest, setPullRequest, usePullRequestContext } from "./PullRequestContext";
import { useCommitsBetweenBranches, useCommitsDiffBetweenBranches } from "../commits/useCommits";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { CommitsHistory } from "../commits/CommitsTable";
import { CommitDiffViewer } from "../commits/CommitDiff";

type NewPullRequestPageProps = {
  repositoryId: Repository["_id"];
};

export const NewPullRequestPage: FC<NewPullRequestPageProps> = ({ repositoryId }) => {
  const { pullRequest, pullRequestDispatcher } = usePullRequestContext();

  const { repository }: any = useRepositoryContext();
  const { owner, name } = repository as Repository;

  useEffect(() => {
    pullRequestDispatcher(
      setPullRequest({
        ...initialPullRequest,
        repositoryId,
      })
    );
  }, [repositoryId]);

  const { commits, isLoading } = useCommitsBetweenBranches(owner, name, pullRequest.csm.base, pullRequest.csm.compare, [
    pullRequest.csm.base,
    pullRequest.csm.compare,
  ]);

  const { commit } = useCommitsDiffBetweenBranches(owner, name, pullRequest.csm.base, pullRequest.csm.compare, [
    pullRequest.csm.base,
    pullRequest.csm.compare,
  ]);

  return (
    <>
      <div className="">
        <div className="mb-5">
          <DefinePullRequestForm />
        </div>
        {!isLoading && commits && !commits?.length ? (
          <div className="text-center text-3xl">There isn’t anything to compare.</div>
        ) : (
          <></>
        )}

        {commits && commits.length ? <CommitsHistory username={owner} repoName={name} commits={commits} /> : <></>}
        {commit && commit.diff?.length ? <CommitDiffViewer commit={commit} /> : <></>}
      </div>
    </>
  );
};
