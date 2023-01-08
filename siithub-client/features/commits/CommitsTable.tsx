import moment from "moment";
import Link from "next/link";
import { type FC, useEffect } from "react";
import NotFound from "../../core/components/NotFound";
import { useResult } from "../../core/contexts/Result";
import { HashtagLink } from "../../core/components/HashtagLink";
import { Spinner } from "../../core/components/Spinner";
import { useCommits } from "./useCommits";
import { ProfilePicture } from "../../core/components/ProfilePicture";

type DirectoryTableProps = {
  username: string;
  repoName: string;
  branch: string;
};

export const CommitsTable: FC<DirectoryTableProps> = ({ username, repoName, branch }) => {
  const { result, setResult } = useResult("trees");
  const { commits, error, isLoading } = useCommits(username, repoName, branch);

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
          <table className="w-full">
            <tbody>
              {isLoading ? (
                <tr className="bg-white border-b text-md">
                  <td colSpan={4}>
                    <div className="flex min-h-full items-center justify-center">
                      <Spinner />
                    </div>
                  </td>
                </tr>
              ) : (
                commits?.map((commit) => (
                  <tr key={commit.sha} className="bg-white border-b text-md">
                    <td className="p-3 w-3">
                      <ProfilePicture username={commit.author} size={20} />
                    </td>
                    <td className="p-3 hover:text-blue-400 hover:underline w-2/6">
                      <HashtagLink
                        href={`/${username}/${repoName}/commits/${encodeURIComponent(branch)}/${commit.sha}`}
                      >
                        {truncate(commit.message, 100)}
                      </HashtagLink>
                    </td>
                    <td className="p-3 text-gray-400 w-3/6">
                      <Link href={`/${username}/${repoName}/commits/${encodeURIComponent(branch)}/${commit.sha}`}>
                        {commit.sha}
                      </Link>
                    </td>
                    <td className="p-3 text-gray-400">{moment(commit.date).fromNow()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
