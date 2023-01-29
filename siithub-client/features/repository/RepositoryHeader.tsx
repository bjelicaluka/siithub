import { BookOpenIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { type FC } from "react";
import { StarButton } from "../stars/StarButton";
import { ForkButton, ForkIcon } from "./ForkButton";
import { type Repository } from "./repository.service";
import { useRepositoryContext } from "./RepositoryContext";

type RepositoryHeaderProps = {
  repo?: string;
  username?: string;
};

export const RepositoryHeader: FC<RepositoryHeaderProps> = ({}) => {
  const { repository } = useRepositoryContext();
  const { owner: username, name: repo, counters, forkedFromRepo } = repository as Repository;

  return repository ? (
    <div>
      <div className="flex">
        <div className="flex items-center grow">
          {forkedFromRepo ? (
            <ForkIcon />
          ) : repository.type === "public" ? (
            <BookOpenIcon className="h-4 w-4" />
          ) : (
            <LockClosedIcon className="h-4 w-4" />
          )}

          <Link className="text-2xl font-semibold  text-blue-500 hover:underline ml-3" href={`/users/${username}`}>
            {username}
          </Link>
          <span className="text-2xl font-semibold  text-blue-500 ml-1 mr-1">/</span>
          <Link className="text-2xl font-semibold  text-blue-500 hover:underline" href={`/${username}/${repo}`}>
            {repo}
          </Link>
          <span className="ml-3 font-medium leading-6 rounded-full px-2 mr-10 bg-gray-300 border">
            {repository.type === "public" ? "Public" : "Private"}
          </span>
        </div>

        <StarButton repo={repo} username={username} count={counters?.stars ?? 0} />
        <ForkButton repo={repo} username={username} count={counters?.forks ?? 0} />
      </div>
      {forkedFromRepo && (
        <p className="text-sm">
          forked from{" "}
          <Link
            className="font-semibold text-blue-500 hover:underline "
            href={`/${forkedFromRepo.owner}/${forkedFromRepo.name}`}
          >
            {forkedFromRepo.owner}/{forkedFromRepo.name}
          </Link>
        </p>
      )}
    </div>
  ) : (
    <></>
  );
};
