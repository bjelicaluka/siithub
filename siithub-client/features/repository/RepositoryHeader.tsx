import { BookOpenIcon, CodeBracketIcon, Cog8ToothIcon, LockClosedIcon, StarIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, type FC } from "react";
import NotFound from "../../core/components/NotFound";
import { useResult } from "../../core/contexts/Result";
import { StarButton } from "../stars/StarButton";
import { useRepository } from "./useRepositories";

type RepositoryHeaderProps = {
  repo: string;
  username: string;
  activeTab: string;
};

export const RepositoryHeader: FC<RepositoryHeaderProps> = ({ username, repo, activeTab }) => {
  const { result, setResult } = useResult("repositories");
  const { result: starResult, setResult: setStarResult } = useResult("stars");
  const { repository, error } = useRepository(username, repo, [result, starResult]);

  useEffect(() => {
    if (!result && !starResult) return;
    setResult(undefined);
    setStarResult(undefined);
  }, [result, setResult, starResult, setStarResult]);

  if (error) return <NotFound />;

  return repository ? (
    <div>
      <div className="flex">
        <div className="flex items-center grow">
          {repository.type === "public" ? <BookOpenIcon className="h-4 w-4" /> : <LockClosedIcon className="h-4 w-4" />}

          <Link className="text-2xl font-semibold  text-blue-500 hover:underline ml-3" href={`/users/${username}`}>
            {username}
          </Link>
          <span className="text-2xl font-semibold  text-blue-500 ml-1 mr-1">/</span>
          <Link className="text-2xl font-semibold  text-blue-500 hover:underline" href={`/${username}/${repo}`}>
            {repo}
          </Link>
          <span className="ml-3 font-medium leading-6 rounded-full px-2 mr-10">
            {repository.type === "public" ? "Public" : "Private"}
          </span>
        </div>

        <div>
          <StarButton repo={repo} username={username}></StarButton>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};
