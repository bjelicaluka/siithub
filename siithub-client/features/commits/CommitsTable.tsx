import moment from "moment";
import Link from "next/link";
import { Fragment, type FC } from "react";
import NotFound from "../../core/components/NotFound";
import { HashtagLink } from "../../core/components/HashtagLink";
import { Spinner } from "../../core/components/Spinner";
import { type Commit, useCommits } from "./useCommits";
import { ProfilePicture } from "../../core/components/ProfilePicture";
import { truncate } from "../../core/utils/string";
import { CodeBracketIcon } from "@heroicons/react/20/solid";
import { BranchesMenu } from "../branches/BranchesMenu";
import { FilePath } from "../file/FilePath";

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

  const CommitCard: FC<{ commit: Commit }> = ({ commit }) => {
    return (
      <tr key={commit.sha} className="bg-white border-2 border-gray-200 text-md">
        <td className="w-5/6 p-2">
          <div className="hover:text-blue-400 hover:underline mb-1">
            <HashtagLink href={`/${username}/${repoName}/commit/${commit.sha}`}>
              {truncate(commit.message, 100)}
            </HashtagLink>
          </div>
          <span className="flex text-sm">
            {commit.author.username ? (
              <>
                <ProfilePicture username={commit.author.username} size={20} />{" "}
                <span className="mr-2 ml-2">{commit.author.username}</span>
              </>
            ) : (
              <span className="mr-2 ml-2">{commit.author.name}</span>
            )}
            committed {moment(commit.date).fromNow()}
          </span>
        </td>
        <td className="text-blue-400 text-sm w-1/12 p-2">
          <Link href={`/${username}/${repoName}/commit/${commit.sha}`}>{commit.sha.substring(0, 6)}</Link>
        </td>
        <td className="text-gray-400 w-1/12 p-2">
          <button>
            <Link href={`/${username}/${repoName}/tree/${commit.sha}`}>
              <CodeBracketIcon className="h-5 w-5" />
            </Link>
          </button>
        </td>
      </tr>
    );
  };

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
        <div>
          <table className="w-full">
            <tbody>
              {isLoading ? (
                <tr className="bg-white border-2 border-gray-200 text-md">
                  <td colSpan={5}>
                    <div className="flex min-h-full items-center justify-center">
                      <Spinner size={20} />
                    </div>
                  </td>
                </tr>
              ) : (
                commits?.map((commit) => {
                  const date = commit.date.substring(0, 10);
                  const isNewDate = date !== currentDate;
                  if (isNewDate) currentDate = date;
                  return (
                    <Fragment key={commit.sha}>
                      {isNewDate && (
                        <tr>
                          <td colSpan={5} className="p-3 font-semibold">
                            {`Commits on ${moment(commit.date).format("MMM D, YYYY")}`}
                          </td>
                        </tr>
                      )}
                      <CommitCard commit={commit} />
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
