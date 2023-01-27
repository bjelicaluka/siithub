import { useRouter } from "next/router";
import { CommitsTable } from "../../../../../features/commits/CommitsTable";

const Commits = () => {
  const router = useRouter();
  const { repository, username, branch, path } = router.query;
  return (
    <CommitsTable
      branch={branch as string}
      repoName={repository as string}
      username={username as string}
      filePath={(path as string[]).join("/")}
    />
  );
};

export default Commits;
