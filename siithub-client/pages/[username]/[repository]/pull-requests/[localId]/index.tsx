import { useRouter } from "next/router";
import { useRepositoryContext } from "../../../../../features/repository/RepositoryContext";
import { PullRequestPage } from "../../../../../features/pull-requests/PullRequestPage";

const PullRequest = () => {
  const { repository } = useRepositoryContext();
  const repositoryId = repository?._id ?? "";

  const router = useRouter();
  const { localId } = router.query;

  return (
    <>
      <PullRequestPage repositoryId={repositoryId} pullRequestId={+(localId?.toString() ?? "0")} />
    </>
  );
};

export default PullRequest;
