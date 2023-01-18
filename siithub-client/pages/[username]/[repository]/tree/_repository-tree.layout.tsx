import Link from "next/link";
import { useRouter } from "next/router";
import { type FC, type PropsWithChildren } from "react";
import { BranchesMenu } from "../../../../features/branches/BranchesMenu";
import { CommitsIcon } from "../../../../features/commits/CommitsIcon";
import { useCommitCount } from "../../../../features/commits/useCommits";

export const RepositoryTreeLayout: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const { repository, username, branch } = router.query;

  const { count } = useCommitCount(username as string, repository as string, branch as string);

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <BranchesMenu count={true} />

        <div className="flex items-center justify-end">
          <Link
            className="flex hover:text-blue-800 w-full"
            href={`/${username}/${repository}/commits/${encodeURIComponent(branch as string)}`}
          >
            <CommitsIcon className="mt-1 mr-1" />
            {count} commits
          </Link>
        </div>
      </div>

      {children}
    </>
  );
};

export default RepositoryTreeLayout;
