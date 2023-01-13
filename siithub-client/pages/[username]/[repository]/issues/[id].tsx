import { useRouter } from "next/router";
import { IssuePage } from "../../../../features/issues/IssuePage";
import { IssueContextProvider } from "../../../../features/issues/IssueContext";
import { useRepositoryContext } from "../../../../features/repository/RepositoryContext";

const Labels = () => {
  const { repository } = useRepositoryContext();
  const repositoryId = repository?._id ?? "";

  const router = useRouter();
  const issueId = router?.query?.id?.toString() ?? "";

  if (!issueId) return <></>;

  return (
    <>
      <IssueContextProvider>
        <IssuePage repositoryId={repositoryId} existingIssueId={issueId} />
      </IssueContextProvider>
    </>
  );
};

export default Labels;
