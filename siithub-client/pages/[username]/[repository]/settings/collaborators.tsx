import { useRouter } from "next/router";
import { CollaboratorsPage } from "../../../../features/collaborators/CollaboratorsPage";

const Collaborators = () => {
  const router = useRouter();
  const { repository, username } = router.query;

  if (!repository || !username) return <></>;

  return (
    <>
      <div className="flex min-h-full items-center justify-center">
        <div className="w-full max-w-6xl space-y-">
          <CollaboratorsPage username={username?.toString()} repo={repository?.toString()} />
        </div>
      </div>
    </>
  );
};

export default Collaborators;
