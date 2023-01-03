import { useRouter } from "next/router";
import { FilePreviewPage } from "../../../../../features/file/FilePreviewPage";

const Blob = () => {
  const router = useRouter();
  const { repository, username, path, branch } = router.query;

  return (
    <>
      {!!repository && !!username && !!branch && !!path ? (
        <>
          <div className="flex justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-6xl space-y-">
              <FilePreviewPage
                repoName={repository.toString()}
                username={username.toString()}
                branch={branch.toString()}
                blobPath={(path as string[]).join("/")}
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

export default Blob;
