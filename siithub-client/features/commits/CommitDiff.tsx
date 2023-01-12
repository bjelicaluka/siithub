import { type FC, useEffect } from "react";
import NotFound from "../../core/components/NotFound";
import { useResult } from "../../core/contexts/Result";
import { useCommit } from "./useCommits";
import ReactDiffViewer from "react-diff-viewer-continued";
import { truncate } from "../../core/utils/string";
import { useDefaultBranch } from "../branches/useBranches";
import Link from "next/link";

type CommitDiffProps = {
  username: string;
  repoName: string;
  sha: string;
};

export const CommitDiff: FC<CommitDiffProps> = ({ username, repoName, sha }) => {
  const { defaultBranch } = useDefaultBranch(username, repoName);

  const { commit, error, isLoading } = useCommit(username, repoName, sha);

  if (error) return <NotFound />;

  return (
    <>
      {commit.diff.map((diff, i) => {
        return (
          <div
            key={i + truncate(diff.old?.content ?? "", 5) + truncate(diff.new?.content ?? "", 5)}
            className="w-full overflow-x-scroll"
          >
            <ReactDiffViewer
              styles={{
                diffContainer: {},
              }}
              leftTitle={
                <Link
                  href={`/${username}/${repoName}/blob/${defaultBranch.branch}/${diff.old.path}`}
                  className="hover:text-blue-400 hover:underline text-sm"
                >
                  {diff.old.path}
                </Link>
              }
              rightTitle={
                <Link
                  href={`/${username}/${repoName}/blob/${defaultBranch.branch}/${diff.new.path}`}
                  className="hover:text-blue-400 hover:underline text-sm"
                >
                  {diff.new.path}
                </Link>
              }
              oldValue={diff.old?.content}
              newValue={diff.new?.content}
              splitView={true}
            />
          </div>
        );
      })}
    </>
  );
};
