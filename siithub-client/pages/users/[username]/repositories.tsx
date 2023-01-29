import { useRouter } from "next/router";
import { UsersRepos } from "../../../features/users/UsersRepos";

const Repos = () => {
  const router = useRouter();
  const { username } = router.query;

  if (!username) return <></>;

  return (
    <div className="m-5">
      <UsersRepos username={username.toString()} />
    </div>
  );
};

export default Repos;
