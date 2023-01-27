import { useRouter } from "next/router";
import { useRepositoryContext } from "../../../../../features/repository/RepositoryContext";
import { PullRequestCommitsPage } from "../../../../../features/pull-requests/PullRequestCommitsPage";

const PullRequestCommits = () => {
  const { repository } = useRepositoryContext();
  const repositoryId = repository?._id ?? "";

  const router = useRouter();
  const { localId } = router.query;

  return (
    <>
      <PullRequestCommitsPage repositoryId={repositoryId} pullRequestId={+(localId?.toString() ?? "0")} />
    </>
  );
};

export default PullRequestCommits;
