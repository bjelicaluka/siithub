import { useRouter } from "next/router";
import { PullRequestContextProvider } from "../../../../features/pull-requests/PullRequestContext";
import { useRepositoryContext } from "../../../../features/repository/RepositoryContext";
import { PullRequestPage } from "../../../../features/pull-requests/PullRequestPage";

const Labels = () => {
  const { repository } = useRepositoryContext();
  const repositoryId = repository?._id ?? "";

  const router = useRouter();
  const { localId } = router.query;

  return (
    <>
      <PullRequestContextProvider>
        <PullRequestPage repositoryId={repositoryId} pullRequestId={+(localId?.toString() ?? "0")} />
      </PullRequestContextProvider>
    </>
  );
};

export default Labels;
