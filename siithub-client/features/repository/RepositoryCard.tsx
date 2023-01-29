import { StarIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { type FC } from "react";
import { ForkIcon } from "./ForkButton";
import { type Repository } from "./repository.service";

type RepositoryCardProps = {
  repository: Repository;
  withUser?: boolean;
};

export const RepositoryCard: FC<RepositoryCardProps> = ({ repository, withUser = true }) => {
  return (
    <div className="border p-3">
      <div>
        {withUser && (
          <>
            <Link className="text-xl font-semibold text-blue-500 hover:underline" href={`/users/${repository.owner}`}>
              {repository.owner}
            </Link>
            <span className="text-xl font-semibold  text-blue-500 ml-1 mr-1">/</span>
          </>
        )}
        <Link
          className="text-xl font-semibold text-blue-500 hover:underline"
          href={`/${repository.owner}/${repository.name}`}
        >
          {repository.name}
        </Link>
        <span className="ml-3 text-sm leading-6 rounded-full px-2 mr-10 bg-gray-300 border">
          {repository.type === "public" ? "Public" : "Private"}
        </span>
      </div>
      {repository.forkedFromRepo && (
        <p className="text-sm">
          forked from{" "}
          <Link
            className="font-semibold text-blue-500 hover:underline "
            href={`/${repository.forkedFromRepo.owner}/${repository.forkedFromRepo.name}`}
          >
            {repository.forkedFromRepo.owner}/{repository.forkedFromRepo.name}
          </Link>
        </p>
      )}
      {repository.description && <div className="mt-2">{repository.description}</div>}
      <div className="flex">
        {repository.counters?.stars && (
          <span className="flex items-center mr-3 mt-2">
            <StarIcon className="h-4 w-4" /> {repository.counters?.stars}
          </span>
        )}
        {repository.counters?.forks && (
          <span className="flex items-center mt-2">
            <ForkIcon className="h-4 w-4" /> {repository.counters?.forks}
          </span>
        )}
      </div>
    </div>
  );
};
