import { useRouter } from "next/router";
import { DirectoryTable } from "../../../../../features/tree/DirectoryTable";

const Tree = () => {
  const router = useRouter();
  const { repository, username, path, branch } = router.query;

  if (!branch) return <></>;

  return (
    <>
      <DirectoryTable
        repoName={repository?.toString() ?? ""}
        username={username?.toString() ?? ""}
        branch={branch.toString()}
        treePath={(path as string[]).join("/")}
      />
    </>
  );
};

export default Tree;
