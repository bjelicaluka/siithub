import { useRouter } from "next/router";
import { MilestonesPage } from "../../../../features/milestones/MilestonesPage";

const Milestones = () => {
  const router = useRouter();
  const { repository, username } = router.query;

  return (
    <>
      <MilestonesPage repo={repository?.toString() ?? ""} username={username?.toString() ?? ""} />
    </>
  );
};

export default Milestones;
