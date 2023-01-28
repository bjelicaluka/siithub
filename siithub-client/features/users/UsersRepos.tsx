import Link from "next/link";
import { type FC } from "react";
import NotFound from "../../core/components/NotFound";
import { RepositoryCard } from "../repository/RepositoryCard";
import { useUsersRepositories } from "../repository/useRepositories";

type UsersReposProps = {
  username: string;
};

export const UsersRepos: FC<UsersReposProps> = ({ username }) => {
  const { repositories, error } = useUsersRepositories(username);

  if (error) return <NotFound />;

  return (
    <>
      <div className="text-right m-2">
        <Link
          href="/repository/create"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 text-xs py-1 px-2 font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          New
        </Link>
      </div>
      {repositories?.map((repo) => (
        <RepositoryCard repository={repo} withUser={false} key={repo._id} />
      ))}
    </>
  );
};
