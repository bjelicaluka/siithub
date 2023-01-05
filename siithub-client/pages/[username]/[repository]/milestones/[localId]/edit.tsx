import { useRouter } from "next/router";
import { MilestoneEdit } from "../../../../../features/milestones/MilestoneEdit";

const EditMilestone = () => {
  const router = useRouter();
  const { repository, username, localId } = router.query;

  return (
    <>
      <MilestoneEdit
        repo={repository?.toString() ?? ""}
        username={username?.toString() ?? ""}
        localId={+(localId?.toString() ?? "0")}
      />
    </>
  );
};

export default EditMilestone;
