import { useRouter } from "next/router";
import { CommitDiff } from "../../../../features/commits/CommitDiff";

const Commit = () => {
  const router = useRouter();
  const { repository, username, sha } = router.query;

  return <CommitDiff repoName={repository as string} username={username as string} sha={sha as string} />;
};

export default Commit;
