import { useRouter } from "next/router";
import { FilePreviewPage } from "../../../../../features/file/FilePreviewPage";

const Blob = () => {
  const router = useRouter();
  const { repository, username, path, branch } = router.query;

  if (!branch || !path) return <></>;

  return (
    <>
      <FilePreviewPage
        repoName={repository?.toString() ?? ""}
        username={username?.toString() ?? ""}
        branch={branch.toString()}
        blobPath={(path as string[]).join("/")}
      />
    </>
  );
};

export default Blob;
