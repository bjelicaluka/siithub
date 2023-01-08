import { type FC, useEffect } from "react";
import NotFound from "../../core/components/NotFound";
import { useResult } from "../../core/contexts/Result";
import { useCommit } from "./useCommits";
import ReactDiffViewer from "react-diff-viewer";

type CommitDiffProps = {
  username: string;
  repoName: string;
  sha: string;
};

export const CommitDiff: FC<CommitDiffProps> = ({ username, repoName, sha }) => {
  const { result, setResult } = useResult("trees");
  const { commit, error, isLoading } = useCommit(username, repoName, sha);

  useEffect(() => {
    if (!result) return;
    setResult(undefined);
  }, [result, setResult]);

  const truncate = (str: string, len: number) => (str.length > len ? str.substring(0, len - 3) + "..." : str);

  if (error) return <NotFound />;

  return (
    <>
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <div className="border-2 border-gray-200">
          {commit.diff.map((diff, i) => {
            return (
              <ReactDiffViewer
                key={i + truncate(diff?.old ?? "", 5) + truncate(diff?.new ?? "", 5)}
                oldValue={diff.old}
                newValue={diff.new}
                splitView={true}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};
