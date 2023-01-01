import { useEffect, type FC } from "react";
import { useResult } from "../../core/contexts/Result";
import { UserCard } from "../users/UserCard";
import { useStargazers } from "./useStars";

type RepoStargazersPageProps = {
  repo: string;
  username: string;
};

export const RepoStargazersPage: FC<RepoStargazersPageProps> = ({ username, repo }) => {
  const { result, setResult } = useResult("repositories");
  const { result: starResult, setResult: setStarResult } = useResult("stars");
  const { users, error } = useStargazers(username, repo, [result, starResult]);

  useEffect(() => {
    if (!result && !starResult) return;
    setResult(undefined);
    setStarResult(undefined);
  }, [result, setResult, starResult, setStarResult]);

  return (
    <div>
      <p className="text-xl m-3">Stargazers</p>
      {users?.map((user) => (
        <UserCard user={user} key={user._id} />
      ))}
    </div>
  );
};
