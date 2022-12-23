import { useRouter } from "next/router";
import { IssuesPage } from "../../../../features/issues/IssuesPage";

const Issues = () => {
  
  const router = useRouter();
  const repositoryId = router.query?.repositoryId?.toString() ?? '';

  return (
    <>
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl space-y-">
          { repositoryId ? <IssuesPage repositoryId={repositoryId} /> : <></> }
        </div>
      </div>
    </>
  );
};

export default Issues;
