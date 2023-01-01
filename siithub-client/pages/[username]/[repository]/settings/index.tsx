import { useRouter } from "next/router";
import { RepoSettingsPage } from "../../../../features/repository/RepoSettingsPage";

const RepositorySettings = () => {
  const router = useRouter();
  const { repository, username } = router.query;

  if (!repository || !username) return <></>;

  return (
    <>
      <RepoSettingsPage repo={repository.toString()} username={username.toString()} />
    </>
  );
};

export default RepositorySettings;
