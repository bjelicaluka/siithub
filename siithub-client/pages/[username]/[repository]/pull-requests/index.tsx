import { PullRequestsPage } from "../../../../features/pull-requests/PullRequestsPage";
import { useRepositoryContext } from "../../../../features/repository/RepositoryContext";

const PullRequests = () => {
  const { repository } = useRepositoryContext();
  const repositoryId = repository?._id ?? "";

  return (
    <>
      <PullRequestsPage repositoryId={repositoryId} />
    </>
  );
};

export default PullRequests;
