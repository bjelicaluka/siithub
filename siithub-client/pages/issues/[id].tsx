import { useRouter } from "next/router";
import { IssuePage } from "../../features/issues/IssuePage";
import { IssueContextProvider } from "../../features/issues/IssueContext";

const Labels = () => {
  
  const router = useRouter();
  const issueId = router?.query?.id as string;

  return (
    <>
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl space-y-">
          { issueId ?
            <IssueContextProvider><IssuePage existingIssueId={issueId} /></IssueContextProvider> :
            <></>
          }
        </div>
      </div>
    </>
  );
};

export default Labels;
