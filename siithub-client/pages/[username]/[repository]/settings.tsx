import { useRouter } from "next/router";
import { RepoSettingsPage } from "../../../features/repository/RepoSettingsPage";

const RepositorySettings = () => {
  const router = useRouter();
  const { repository, username } = router.query;

  return (
    <>
      {!!repository && !!username ? (
        <>
          <div className="m-10">
            <div className="">
              <RepoSettingsPage repo={repository.toString()} username={username.toString()} />
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default RepositorySettings;
