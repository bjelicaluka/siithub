import { useRouter } from "next/router";
import { StarredRepos } from "../../../features/users/StarredRepos";

const Stars = () => {
  const router = useRouter();
  const { username } = router.query;

  return (
    <>
      {username ? (
        <>
          <div className="m-10">
            <div className="">
              <StarredRepos username={username.toString()} />
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default Stars;
