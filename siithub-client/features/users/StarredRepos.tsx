import { type FC, useEffect } from "react";
import NotFound from "../../core/components/NotFound";
import { useResult } from "../../core/contexts/Result";
import { RepositoryCard } from "../repository/RepositoryCard";
import { useStarredRepositories } from "../repository/useRepositories";

type StarredReposProps = {
  username: string;
};

export const StarredRepos: FC<StarredReposProps> = ({ username }) => {
  const { result, setResult } = useResult("repositories");
  const { repositories, error } = useStarredRepositories(username, [result]);

  useEffect(() => {
    if (!result) return;
    setResult(undefined);
  }, [result, setResult]);

  if (error) return <NotFound />;

  return (
    <>
      <p className="text-3xl m-3">Stars</p>
      {repositories?.map((repo) => (
        <RepositoryCard repository={repo} key={repo._id} />
      ))}
    </>
  );
};
