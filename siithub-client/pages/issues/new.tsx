import { IssueContextProvider } from "../../features/issues/IssueContext";
import { IssuePage } from "../../features/issues/IssuePage";

const Labels = () => {
  
  return (
    <>
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl space-y-">
          <IssueContextProvider>
            <IssuePage />
          </IssueContextProvider>
        </div>
      </div>
    </>
  );
};

export default Labels;
