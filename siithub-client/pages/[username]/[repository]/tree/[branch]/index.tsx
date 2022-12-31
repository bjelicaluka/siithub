import { useRouter } from "next/router";
import { DirectoryTable } from "../../../../../features/tree/DirectoryTable";

const Tree = () => {
  const router = useRouter();
  const { repository, username, branch } = router.query;

  return (
    <>
      {!!repository && !!username && !!branch ? (
        <>
          <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-6xl space-y-">
              <DirectoryTable
                repoName={repository.toString()}
                username={username.toString()}
                branch={branch.toString()}
                treePath={""}
              />
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default Tree;
