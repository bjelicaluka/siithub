import { useRouter } from "next/router";
import { CommitsSearch } from "../../features/advance-search/CommitsSearch";

const Commits = () => {
  const router = useRouter();
  const { param, repositoryId } = router.query;

  if (!repositoryId) return <></>;

  return <CommitsSearch param={param?.toString() ?? ""} repositoryId={repositoryId?.toString() ?? ""} />;
};

export default Commits;
