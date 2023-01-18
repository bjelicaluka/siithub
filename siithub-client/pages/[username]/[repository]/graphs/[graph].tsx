import { useRouter } from "next/router";
import { RepoInsights } from "../../../../features/insights/insights-page";

const RepositoryInsights = () => {
  const router = useRouter();
  const { repository, username, graph } = router.query;

  if (!repository || !username || !graph) return <></>;

  return (
    <>
      <RepoInsights repo={repository.toString()} username={username.toString()} graph={graph as any} />
    </>
  );
};

export default RepositoryInsights;
