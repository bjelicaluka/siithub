import Link from "next/link";
import { type FC } from "react";
import { ProfilePicture } from "../../core/components/ProfilePicture";
import { useForks } from "../repository/useRepositories";

export const ForksInsights: FC<{ repo: string; username: string }> = ({ username, repo }) => {
  const { forks } = useForks(username, repo);
  return (
    <div className="w-full">
      <div className="flex items-center">
        <ProfilePicture username={username} size={16} />
        <Link className="hover:text-blue-500 hover:underline ml-3" href={`/users/${username}`}>
          {username}
        </Link>
        <span className="mx-1">/</span>
        <Link className="hover:text-blue-500 hover:underline" href={`/${username}/${repo}`}>
          {repo}
        </Link>
      </div>
      {forks?.map((fork) => (
        <div key={fork.owner} className="flex items-center">
          <svg width="20" height="24" viewBox="0 0 20 24" fill="#d1d5da">
            <path fillRule="evenodd" clipRule="evenodd" d="M10 0V13H20V14H9V0H10Z" />
          </svg>
          <ProfilePicture username={fork.owner} size={16} />
          <Link className="text-sm font-semibold text-blue-500 hover:underline ml-3" href={`/users/${fork.owner}`}>
            {fork.owner}
          </Link>
          <span className="text-sm font-semibold text-blue-500 mx-1">/</span>
          <Link className="text-sm font-semibold text-blue-500 hover:underline" href={`/${fork.owner}/${fork.name}`}>
            {fork.name}
          </Link>
        </div>
      ))}
    </div>
  );
};
