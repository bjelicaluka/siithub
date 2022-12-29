import { useRouter } from "next/router";
import { RepositoryView } from "../../../features/repository/repository-view";

const Repository = () => {
  const router = useRouter();
  const { repository, username } = router.query;

  return (
    <>
      {!!repository && !!username ? (
        <>
          <div className="m-10">
            <div className="">
              <RepositoryView repo={repository.toString()} username={username.toString()} />
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default Repository;
