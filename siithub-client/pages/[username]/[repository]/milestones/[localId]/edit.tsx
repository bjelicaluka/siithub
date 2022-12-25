import { useRouter } from "next/router";
import { MilestoneEdit } from "../../../../../features/milestones/MilestoneEdit";

const EditMilestone = () => {
  
  const router = useRouter();
  const {repository, username, localId} = router.query;

  return (
    <>
      {
        !!repository && !!username && localId ? <>
          <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-6xl space-y-">
              <MilestoneEdit repo={repository.toString()} username={username.toString()} localId={+localId.toString()} />
            </div>
          </div>
        </> :
        <></>
      }
    </>
  );
};

export default EditMilestone;