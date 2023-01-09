import { useRouter } from "next/router";
import { Spinner } from "../../../../../core/components/Spinner";
import { CommitsTable } from "../../../../../features/commits/CommitsTable";
import { useCommits } from "../../../../../features/commits/useCommits";

const Commits = () => {
  const router = useRouter();
  const { repository, username, branch } = router.query;

  const { commits, isLoading, error } = useCommits(username as string, repository as string, branch as string);

  if (isLoading) return <Spinner />;

  if (error) return <>Not found</>;

  return <CommitsTable branch={branch as string} repoName={repository as string} username={username as string} />;
};

export default Commits;
