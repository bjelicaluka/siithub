import { useRouter } from "next/router";
import { RepositoriesSearch } from "../../features/advance-search/RepositoriesSearch";

const Repositories = () => {
  const router = useRouter();
  const { param } = router.query;

  if (!router) return <></>;

  return <RepositoriesSearch param={param?.toString() ?? ""} />;
};

export default Repositories;
