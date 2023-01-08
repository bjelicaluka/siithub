import { useRouter } from "next/router";
import { Spinner } from "../../../../../core/components/Spinner";
import { CommitDiff } from "../../../../../features/commits/CommitDiff";
import { useCommit } from "../../../../../features/commits/useCommits";

const Commit = () => {
  const router = useRouter();
  const { repository, username, sha } = router.query;

  const { commit, isLoading, error } = useCommit(username as string, repository as string, sha as string);

  if (isLoading) return <Spinner />;

  if (error) return <>Not found</>;

  return <CommitDiff repoName={repository as string} username={username as string} sha={sha as string} />;
};

export default Commit;
