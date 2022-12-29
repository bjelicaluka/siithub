import { useRouter } from "next/router";
import { RepoStargazersPage } from "../../../features/stars/RepoStargazersPage";

const RepositoryStargazers = () => {
  const router = useRouter();
  const { repository, username } = router.query;

  return (
    <>
      {!!repository && !!username ? (
        <>
          <div className="m-10">
            <div className="">
              <RepoStargazersPage repo={repository.toString()} username={username.toString()} />
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default RepositoryStargazers;
