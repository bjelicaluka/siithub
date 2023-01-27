import { NewPullRequestPage } from "../../../../features/pull-requests/NewPullRequestPage";
import { PullRequestContextProvider } from "../../../../features/pull-requests/PullRequestContext";
import { useRepositoryContext } from "../../../../features/repository/RepositoryContext";

const NewPullRequest = () => {
  const { repository } = useRepositoryContext();
  const repositoryId = repository?._id ?? "";

  return (
    <>
      <PullRequestContextProvider>
        <NewPullRequestPage repositoryId={repositoryId} />
      </PullRequestContextProvider>
    </>
  );
};

export default NewPullRequest;
