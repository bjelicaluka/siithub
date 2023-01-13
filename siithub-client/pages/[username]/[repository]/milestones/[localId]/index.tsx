import { useRouter } from "next/router";
import { MilestonePage } from "../../../../../features/milestones/MilestonePage";

const Milestone = () => {
  const router = useRouter();
  const { repository, username, localId } = router.query;

  return (
    <>
      <MilestonePage
        repo={repository?.toString() ?? ""}
        username={username?.toString() ?? ""}
        localId={+(localId?.toString() ?? "0")}
      />
    </>
  );
};

export default Milestone;
