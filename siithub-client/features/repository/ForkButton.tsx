import Link from "next/link";
import { type FC } from "react";
import { type AuthUser, useAuthContext } from "../../core/contexts/Auth";

export const ForkIcon = ({ className }: any) => {
  return (
    <svg height="16" viewBox="0 0 16 16" version="1.1" width="16" className={"octicon octicon-git-branch " + className}>
      <path
        fillRule="evenodd"
        d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"
      ></path>
    </svg>
  );
};

type ForkButtonProps = {
  repo: string;
  username: string;
  count: number;
};

export const ForkButton: FC<ForkButtonProps> = ({ repo, username, count }) => {
  const myUsername = (useAuthContext()?.user as AuthUser)?.username;

  return myUsername === username ? (
    <button disabled className="inline-flex rounded-md border p-2 ml-2">
      <ForkIcon className="mt-1" />
      <span className="ml-3 font-medium">Fork</span>
      <span className="ml-3 bg-gray-300 border rounded-full px-2 font-semibold">{count}</span>
    </button>
  ) : (
    <button className="rounded-md border p-2 ml-2" disabled={!myUsername}>
      <Link href={`/${username}/${repo}/fork`} className="inline-flex">
        <ForkIcon className="mt-1" />
        <span className="ml-3 font-medium">Fork</span>
        <span className="ml-3 bg-gray-300 border rounded-full px-2 font-semibold">{count}</span>
      </Link>
    </button>
  );
};
