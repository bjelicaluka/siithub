import { useRouter } from "next/router";
import { CreateForkForm } from "../../../features/repository/CreateForkForm";

const Fork = () => {
  const router = useRouter();
  const { repository, username } = router.query;

  if (!repository || !username) return <></>;

  return (
    <div className="m-10">
      <CreateForkForm repo={repository.toString()} username={username.toString()} />
    </div>
  );
};

export default Fork;
