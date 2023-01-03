import { IssueContextProvider } from "../../../../features/issues/IssueContext";
import { IssuePage } from "../../../../features/issues/IssuePage";
import { useRepositoryContext } from "../../../../features/repository/RepositoryContext";

const Labels = () => {
  const { repository } = useRepositoryContext();
  const repositoryId = repository?._id ?? "";

  return (
    <>
      <IssueContextProvider>
        <IssuePage repositoryId={repositoryId} />
      </IssueContextProvider>
    </>
  );
};

export default Labels;
