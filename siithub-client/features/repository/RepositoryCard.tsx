import Link from "next/link";
import { type FC } from "react";
import { type Repository } from "./repository.service";

type RepositoryCardProps = {
  repository: Repository;
};

export const RepositoryCard: FC<RepositoryCardProps> = ({ repository }) => {
  return (
    <div className="border-2 p-3">
      <div>
        <Link className="text-xl font-semibold text-blue-500 hover:underline" href={`/users/${repository.owner}`}>
          {repository.owner}
        </Link>
        <span className="text-xl font-semibold  text-blue-500 ml-1 mr-1">/</span>
        <Link
          className="text-xl font-semibold text-blue-500 hover:underline"
          href={`/${repository.owner}/${repository.name}`}
        >
          {repository.name}
        </Link>
      </div>
      <div>{repository.description}</div>
    </div>
  );
};
