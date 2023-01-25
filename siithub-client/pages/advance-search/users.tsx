import { useRouter } from "next/router";
import { UsersSearch } from "../../features/advance-search/UsersSearch";

const Users = () => {
  const router = useRouter();
  const { param } = router.query;

  if (!router) return <></>;

  return <UsersSearch param={param?.toString() ?? ""} />;
};

export default Users;
