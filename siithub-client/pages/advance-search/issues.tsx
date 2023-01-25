import { useRouter } from "next/router";
import { IssuesSearch } from "../../features/advance-search/IssuesSearch";

const Issues = () => {
  const router = useRouter();
  const { param, repositoryId } = router.query;

  if (!router) return <></>;

  return <IssuesSearch param={param?.toString() ?? ""} repositoryId={repositoryId?.toString() ?? ""} />;
};

export default Issues;
