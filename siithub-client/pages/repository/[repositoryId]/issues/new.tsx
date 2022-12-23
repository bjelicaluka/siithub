import { useRouter } from "next/router";
import { IssueContextProvider } from "../../../../features/issues/IssueContext";
import { IssuePage } from "../../../../features/issues/IssuePage";

const Labels = () => {
  
  const router = useRouter();
  const repositoryId = router.query?.repositoryId?.toString() ?? '';

  return (
    <>
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl space-y-">
          <IssueContextProvider>
            { repositoryId ? <IssuePage repositoryId={repositoryId}  /> : <></> }
          </IssueContextProvider>
        </div>
      </div>
    </>
  );
};

export default Labels;
