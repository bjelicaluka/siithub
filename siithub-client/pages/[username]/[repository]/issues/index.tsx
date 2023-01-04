import { IssuesPage } from "../../../../features/issues/IssuesPage";
import { useRepositoryContext } from "../../../../features/repository/RepositoryContext";

const Issues = () => {
  const { repository } = useRepositoryContext();
  const repositoryId = repository?._id ?? "";

  return (
    <>
      <IssuesPage repositoryId={repositoryId} />
    </>
  );
};

export default Issues;
