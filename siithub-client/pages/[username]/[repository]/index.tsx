import { useRouter } from "next/router";
import { useEffect } from "react";
import { RepositoryView } from "../../../features/repository/repository-view";

const Repository = () => {
  const router = useRouter();
  const { repository, username } = router.query;

  useEffect(() => {
    if (!repository || !username) return;
    router.push(`/${username}/${repository}/tree/master`);
  }, [router, username, repository]);

  return (
    <>
      <RepositoryView repo={repository?.toString() ?? ""} username={username?.toString() ?? ""} />
    </>
  );
};

export default Repository;
