import { useRouter } from "next/router";
import { BranchesPage } from "../../../../features/branches/BranchesPage";

const Branches = () => {
  const router = useRouter();
  const { repository, username } = router.query;

  if (!repository || !username) return <></>;
  return <>{<BranchesPage repo={repository.toString()} username={username.toString()} />}</>;
};

export default Branches;
