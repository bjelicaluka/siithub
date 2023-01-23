import { useMemo, type FC } from "react";
import NotFound from "../../core/components/NotFound";
import { type CommitWithDiff, useCommit } from "./useCommits";
import ReactDiffViewer from "react-diff-viewer-continued";
import { truncate } from "../../core/utils/string";
import Link from "next/link";
import { Spinner } from "../../core/components/Spinner";

type CommitDiffViewerProps = {
  commit: CommitWithDiff;
};

export const CommitDiffViewer: FC<CommitDiffViewerProps> = ({ commit }) => {
  const additions = useMemo(
    () => commit.diff.reduce((acc, val) => acc + (val?.stats?.total_additions || 0), 0),
    [commit]
  );
  const deletions = useMemo(
    () => commit.diff.reduce((acc, val) => acc + (val?.stats?.total_deletions || 0), 0),
    [commit]
  );

  return (
    <>
      <div className="m-2">
        Showing <span className="font-bold">{commit.diff.length}</span> changed files with{" "}
        <span className="text-green-500 font-bold">{additions}</span> additions and{" "}
        <span className="text-red-500 font-bold">{deletions}</span> deletions.
      </div>
      {commit.diff.map((diff, i) => {
        return (
          <div
            key={i + truncate(diff?.old?.content ?? "", 5) + truncate(diff?.new?.content ?? "", 5)}
            className="w-full overflow-x-scroll mt-2"
          >
            <a id={`${i}`} />
            <ReactDiffViewer
              styles={{
                diffContainer: {},
              }}
              leftTitle={
                <Link href={`#${i}`} className="hover:text-blue-400 hover:underline text-sm">
                  {diff?.old?.path}
                </Link>
              }
              rightTitle={
                <Link href={`#${i}`} className="hover:text-blue-400 hover:underline text-sm">
                  {diff?.new?.path}
                </Link>
              }
              oldValue={diff?.old?.content}
              newValue={diff?.new?.content}
              splitView={true}
            />
            {diff?.large && <div className="w-full text-center p-3">Large diffs are not rendered by default</div>}
          </div>
        );
      })}
    </>
  );
};

type CommitDiffProps = {
  username: string;
  repoName: string;
  sha: string;
};

export const CommitDiff: FC<CommitDiffProps> = ({ username, repoName, sha }) => {
  const { commit, error, isLoading } = useCommit(username, repoName, sha);

  if (error) return <NotFound />;

  if (isLoading) return <Spinner size={20} />;

  return (
    <>
      <CommitDiffViewer commit={commit} />
    </>
  );
};
