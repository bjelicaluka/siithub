import { useRouter } from "next/router";
import { useEffect } from "react";
import { useDefaultBranch } from "../../../features/branches/useBranches";
import { RepositoryView } from "../../../features/repository/repository-view";

const Repository = () => {
  const router = useRouter();
  const { repository, username } = router.query;
  const { defaultBranch } = useDefaultBranch(username?.toString() ?? "", repository?.toString() ?? "");

  useEffect(() => {
    if (!repository || !username || !defaultBranch || !defaultBranch.branch) return;
    router.push(`/${username}/${repository}/tree/${encodeURIComponent(defaultBranch.branch)}`);
  }, [router, username, repository, defaultBranch]);

  return (
    <>
      <RepositoryView repo={repository?.toString() ?? ""} username={username?.toString() ?? ""} />
    </>
  );
};

export default Repository;
