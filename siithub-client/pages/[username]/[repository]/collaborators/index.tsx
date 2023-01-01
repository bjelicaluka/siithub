import { useRouter } from "next/router";
import { CollaboratorsPage } from "../../../../features/collaborators/CollaboratorsPage";

const Collaborators = () => {
  const router = useRouter();
  const { repository, username } = router.query;

  return (
    <>
      {!!repository && !!username ? (
        <>
          <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-6xl space-y-">
              <CollaboratorsPage username={username?.toString()} repo={repository?.toString()} />
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default Collaborators;
