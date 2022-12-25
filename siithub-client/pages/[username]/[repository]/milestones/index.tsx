import { useRouter } from "next/router";
import { MilestonesPage } from "../../../../features/milestones/MilestonesPage";

const Milestones = () => {
  
  const router = useRouter();
  const {repository, username} = router.query;

  return (
    <>
      {
        !!repository && !!username ? <>
          <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-6xl space-y-">
              <MilestonesPage repo={repository.toString()} username={username.toString()} />
            </div>
          </div>
        </> :
        <></>
      }
    </>
  );
};

export default Milestones;