import moment from "moment";
import { Fragment, type FC } from "react";
import NotFound from "../../core/components/NotFound";
import { Spinner } from "../../core/components/Spinner";
import { useCommits } from "./useCommits";
import { BranchesMenu } from "../branches/BranchesMenu";
import { FilePath } from "../file/FilePath";
import { CommitCard } from "./CommitCard";

type DirectoryTableProps = {
  username: string;
  repoName: string;
  branch: string;
  filePath?: string;
};

export const CommitsTable: FC<DirectoryTableProps> = ({ username, repoName, branch, filePath }) => {
  const { commits, error, isLoading } = useCommits(username, repoName, branch, filePath ?? "");
  let currentDate = "";

  if (error) return <NotFound />;

  return (
    <>
      <div className="overflow-x-auto relative sm:rounded-lg">
        <div className="mb-3 flex">
          {filePath ? (
            <p className="text-lg items-center">
              History for{" "}
              <FilePath username={username} repoName={repoName} branch={branch} filePath={filePath} forCommits={true} />
            </p>
          ) : (
            <BranchesMenu />
          )}
        </div>
        <div className="">
          {isLoading ? (
            <div className="bg-white border-2 border-gray-200 text-md">
              <div className="flex min-h-full items-center justify-center">
                <Spinner size={20} />
              </div>
            </div>
          ) : (
            commits?.map((commit) => {
              const date = commit.date.substring(0, 10);
              const isNewDate = date !== currentDate;
              if (isNewDate) currentDate = date;
              return (
                <Fragment key={commit.sha}>
                  {isNewDate && (
                    <div className="p-3 font-semibold">{`Commits on ${moment(commit.date).format("MMM D, YYYY")}`}</div>
                  )}
                  <CommitCard commit={commit} username={username} repoName={repoName} />
                </Fragment>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};
