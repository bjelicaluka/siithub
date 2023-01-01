import { useRouter } from "next/router";
import { MilestoneForm } from "../../../../features/milestones/MilestoneForm";

const NewMilestone = () => {
  const router = useRouter();
  const { repository, username } = router.query;

  return (
    <>
      <MilestoneForm repo={repository?.toString() ?? ""} username={username?.toString() ?? ""} />
    </>
  );
};

export default NewMilestone;
