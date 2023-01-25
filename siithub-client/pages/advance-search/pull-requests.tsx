import { useRouter } from "next/router";
import { PullRequestsSearch } from "../../features/advance-search/PullReqestSearch";

const PullRequests = () => {
  const router = useRouter();
  const { param, repositoryId } = router.query;

  if (!router) return <></>;

  return <PullRequestsSearch param={param?.toString() ?? ""} repositoryId={repositoryId?.toString() ?? ""} />;
};

export default PullRequests;
