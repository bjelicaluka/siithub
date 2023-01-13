import Link from "next/link";
import { useRouter } from "next/router";
import { type FC, type PropsWithChildren } from "react";
import { BranchesMenu } from "../../../../features/branches/BranchesMenu";
import { useCommitCount } from "../../../../features/commits/useCommits";

const CommitsIcon = ({ className }: any) => {
  return (
    <svg
      textDecoration="gray"
      height="16"
      viewBox="0 0 16 16"
      version="1.1"
      width="16"
      className={"octicon octicon-history " + className}
    >
      <path
        fillRule="evenodd"
        d="M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684zM7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z"
      ></path>
    </svg>
  );
};

export const RepositoryTreeLayout: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const { repository, username, branch } = router.query;

  const { count } = useCommitCount(username as string, repository as string, branch as string);

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <BranchesMenu />

        {!router.pathname.includes("/commits") && (
          <div className="flex items-center justify-end">
            <Link
              className="flex hover:text-blue-800 w-full"
              href={`/${username}/${repository}/commits/${encodeURIComponent(branch as string)}`}
            >
              <CommitsIcon className="mt-1 mr-1" />
              {count} commits
            </Link>
          </div>
        )}
      </div>

      {children}
    </>
  );
};

export default RepositoryTreeLayout;
