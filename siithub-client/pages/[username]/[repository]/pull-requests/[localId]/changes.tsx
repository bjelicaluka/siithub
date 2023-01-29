import { useRouter } from "next/router";
import { useRepositoryContext } from "../../../../../features/repository/RepositoryContext";
import { PullRequestFileChangesPage } from "../../../../../features/pull-requests/PullRequestFileChangesPage";

const PullRequestFileChanges = () => {
  const { repository } = useRepositoryContext();
  const repositoryId = repository?._id ?? "";

  const router = useRouter();
  const { localId } = router.query;

  return (
    <>
      <PullRequestFileChangesPage repositoryId={repositoryId} pullRequestId={+(localId?.toString() ?? "0")} />
    </>
  );
};

export default PullRequestFileChanges;
